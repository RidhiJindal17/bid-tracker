import User from '../models/User.js';
import Bid from '../models/Bid.js';
import { logActivity } from '../utils/auditLogger.js';
import validator from 'validator';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all team members with optional search, role, and department filters
 * GET /api/users
 */
export const getTeamMembers = async (req, res, next) => {
  try {
    const { search, role, department } = req.query;
    let query = {};

    // Apply Search Filter (by Name or Email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply Role Filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Apply Department Filter
    if (department && department !== 'all') {
      query.department = department;
    }

    // Fetch team members
    const members = await User.find(query)
      .select('-password')
      .populate('assignedBids', 'title value status deadline')
      .sort({ createdAt: -1 })
      .lean();

    // Map members to return count of assigned projects/bids dynamically
    const formattedMembers = members.map(member => {
      const assignedCount = member.assignedBids ? member.assignedBids.length : 0;
      return {
        ...member,
        assignedCount
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMembers.length,
      data: formattedMembers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invite / Add a new team member
 * POST /api/users
 */
export const addTeamMember = async (req, res, next) => {
  let { name, email, role, department } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new AppError('Name is required', 400));
  }
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  if (!role || typeof role !== 'string' || role.trim() === '') {
    return next(new AppError('Role is required', 400));
  }
  if (!department || typeof department !== 'string' || department.trim() === '') {
    return next(new AppError('Department is required', 400));
  }

  const cleanEmail = validator.normalizeEmail(email);
  const cleanName = validator.escape(name.trim());

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return next(new AppError('A user with this email address already exists.', 400));
    }

    // Create user with default temporary password
    const defaultPassword = 'TempPassword123!';
    const newMember = await User.create({
      name: cleanName,
      email: cleanEmail,
      role: role.trim(),
      department: department.trim(),
      password: defaultPassword,
      status: 'offline',
      performanceMetrics: {
        completedTasks: 0,
        revenueContribution: 0,
        efficiency: 100
      }
    });

    logActivity({
      userId: req.user?._id,
      action: 'Team Member Invited',
      entityType: 'User',
      entityId: newMember._id,
      details: `Invited new team member "${cleanName}" (${cleanEmail}) as ${role} inside ${department} department.`,
      req
    });

    // Don't return password in response
    const responseData = newMember.toObject();
    delete responseData.password;

    return res.status(201).json({
      success: true,
      message: 'Team member invited successfully.',
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update team member role, department, status, or performance
 * PUT /api/users/:id
 */
export const updateTeamMember = async (req, res, next) => {
  const { id } = req.params;
  let { name, email, role, department, status, performanceMetrics } = req.body;

  if (email && (typeof email !== 'string' || !validator.isEmail(email))) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const cleanEmail = email ? validator.normalizeEmail(email) : undefined;
  const cleanName = name ? validator.escape(name.trim()) : undefined;

  try {
    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.'
      });
    }

    // Apply updates
    if (cleanName) member.name = cleanName;
    if (cleanEmail) member.email = cleanEmail;
    if (role) member.role = role.trim();
    if (department) member.department = department.trim();
    if (status) member.status = status;
    if (performanceMetrics) {
      member.performanceMetrics = {
        ...member.performanceMetrics,
        ...performanceMetrics
      };
    }

    await member.save();

    logActivity({
      userId: req.user?._id,
      action: 'Team Member Updated',
      entityType: 'User',
      entityId: member._id,
      details: `Updated team member profile for "${member.name}".`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Team member profile updated successfully.',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a team member
 * DELETE /api/users/:id
 */
export const deleteTeamMember = async (req, res, next) => {
  const { id } = req.params;

  try {
    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.'
      });
    }

    // Unassign this user from any active bids before deletion
    await Bid.updateMany(
      { assignedTo: id },
      { $unset: { assignedTo: "" } }
    );

    await User.findByIdAndDelete(id);

    logActivity({
      userId: req.user?._id,
      action: 'Team Member Deleted',
      entityType: 'User',
      entityId: id,
      details: `Deleted team member "${member.name}" (${member.email}).`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Team member deleted and unassigned from projects successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compile aggregate metrics and statistics for the team performance view
 * GET /api/users/performance
 */
export const getTeamPerformance = async (req, res, next) => {
  try {
    const bids = await Bid.find().lean();
    const members = await User.find().lean();

    const totalMembers = members.length;
    const onlineMembers = members.filter(m => m.status === 'online').length;

    // Calculate aggregated project completion
    const closedWonBids = bids.filter(b => b.status === 'Approved');
    const closedWonValuation = closedWonBids.reduce((sum, b) => sum + (b.value || 0), 0);

    // Compute averages
    let totalCompletedTasks = 0;
    let totalEfficiency = 0;
    
    members.forEach(m => {
      const pm = m.performanceMetrics || { completedTasks: 0, efficiency: 100 };
      totalCompletedTasks += pm.completedTasks || 0;
      totalEfficiency += pm.efficiency || 100;
    });

    const averageEfficiency = totalMembers > 0 ? Math.round(totalEfficiency / totalMembers) : 100;

    // Department counts
    const departments = {};
    members.forEach(m => {
      departments[m.department] = (departments[m.department] || 0) + 1;
    });

    // Build department summary list
    const departmentMetrics = Object.entries(departments).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalMembers) * 100)
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalMembers,
        onlineMembers,
        totalCompletedTasks,
        averageEfficiency,
        closedWonValuation,
        departmentMetrics
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch chronological user activities across the team
 * GET /api/users/activities
 */
export const getTeamActivities = async (req, res, next) => {
  try {
    const users = await User.find({}, 'name role department activityHistory').lean();
    let activities = [];

    users.forEach(user => {
      if (user.activityHistory && user.activityHistory.length > 0) {
        user.activityHistory.forEach(act => {
          activities.push({
            id: act._id,
            userName: user.name,
            role: user.role,
            department: user.department,
            action: act.action,
            details: act.details,
            timestamp: act.timestamp
          });
        });
      }
    });

    // Sort activities by timestamp descending (latest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return res.status(200).json({
      success: true,
      data: activities.slice(0, 15) // Top 15 recent activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get count of online users and total users
 * GET /api/users/online-count
 */
export const getOnlineUsersCount = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Count users where lastActive is >= fiveMinutesAgo
    const onlineCount = await User.countDocuments({
      lastActive: { $gte: fiveMinutesAgo }
    });

    const totalCount = await User.countDocuments({});

    return res.status(200).json({
      success: true,
      onlineUsers: onlineCount,
      totalUsers: totalCount
    });
  } catch (error) {
    console.error('Error fetching online users count:', error);
    return res.status(200).json({
      success: false,
      onlineUsers: 0,
      totalUsers: 0,
      message: 'Failed to count online users, using fallback.'
    });
  }
};
