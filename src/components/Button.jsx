import React from "react";

const Button = ({ text, className, bgColor , ...props }) => {
  return (
    <div>
      <button
        {...props}
        className={`bg-[#F5DEB3] w-96 hover:scale-105 rounded-lg px-4 py-2 text-3xl font-sans transition-transform duration-900 italic text-gray-700 ${className}`}
      >
        {text}
      </button>
    </div>
  );
};

export default Button;
