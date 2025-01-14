import React from "react";

const Heading = ({ className, img = true, ...props }) => {
  return (
    <div className="flex text-center items-center justify-center">
      <h1
        {...props}
        className={`text-3xl font-bold pt-4 px-0 mx-0 text-[#A0522D] ${
          img == true ? "pl-8 md:text-5xl" : ""
        } ${className}`}
      >
        Chess Master
      </h1>
      {img && (
        <img
          className="h-16 md:h-20 w-20 object-start pb-0 mx-0 px-0 mt-1"
          src="../assets/bK.svg"
          alt=""
        />
      )}
    </div>
  );
};

export default Heading;
