import User from '../models/User.js';
import Bid from '../models/Bid.js';
import { logActivity } from '../utils/auditLogger.js';

/**
 * Get all team members with optional search, role, and department filters
 * GET /api/users
 */
export const getTeamMembers = async (req, res) => {
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
    console.error('Error inside getTeamMembers controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve team members.',
      error: error.message
    });
  }
};

/**
 * Invite / Add a new team member
 * POST /api/users
 */
export const addTeamMember = async (req, res) => {
  const { name, email, role, department } = req.body;

  if (!name || !email || !role || !department) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, email, role, department.'
    });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Create user with default temporary password
    const defaultPassword = 'TempPassword123!';
    const newMember = await User.create({
      name,
      email,
      role,
      department,
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
      details: `Invited new team member "${name}" (${email}) as ${role} inside ${department} department.`,
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
    console.error('Error inside addTeamMember controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to invite team member.',
      error: error.message
    });
  }
};

/**
 * Update team member role, department, status, or performance
 * PUT /api/users/:id
 */
export const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, department, status, performanceMetrics } = req.body;

  try {
    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.'
      });
    }

    // Apply updates
    if (name) member.name = name;
    if (email) member.email = email;
    if (role) member.role = role;
    if (department) member.department = department;
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
    console.error('Error inside updateTeamMember controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update team member.',
      error: error.message
    });
  }
};

/**
 * Delete a team member
 * DELETE /api/users/:id
 */
export const deleteTeamMember = async (req, res) => {
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
    console.error('Error inside deleteTeamMember controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete team member.',
      error: error.message
    });
  }
};

/**
 * Compile aggregate metrics and statistics for the team performance view
 * GET /api/users/performance
 */
export const getTeamPerformance = async (req, res) => {
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
    console.error('Error inside getTeamPerformance controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compile team performance aggregates.',
      error: error.message
    });
  }
};

/**
 * Fetch chronological user activities across the team
 * GET /api/users/activities
 */
export const getTeamActivities = async (req, res) => {
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
    console.error('Error inside getTeamActivities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team activities.',
      error: error.message
    });
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
