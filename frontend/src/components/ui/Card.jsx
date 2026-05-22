import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true }) => {
  const CardComponent = animate ? motion.div : 'div';
  
  return (
    <CardComponent
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4 }}
      className={`glass rounded-2xl p-6 ${className}`}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
