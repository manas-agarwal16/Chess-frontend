import React from "react";

const Button = ({ text, className, bgColor = 'bg-[#F5DEB3]',width="w-96", ...props }) => {
  return (
    <div>
      <button
        {...props}
        className={`hover:scale-105 rounded-lg px-4 py-2 text-3xl font-sans transition-transform duration-900 italic text-gray-700 ${className} ${bgColor} ${width}`}
      >
        {text}
      </button>
    </div>
  );
};

export default Button;
