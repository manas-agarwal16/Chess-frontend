import React from "react";

function Spinner({ width = 8 }) {
  return (
    <div className="w-full flex justify-center mb-2">
      <div
        className={`w-7 h-7 border-4 border-black border-t-transparent border-solid rounded-full animate-spin`}
      ></div>
    </div>
  );
}

export default Spinner;
