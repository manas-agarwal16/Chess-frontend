import React, { useId, forwardRef } from "react";

function Input(
  {
    label,
    textColor = "text-gray-200",
    labelColor = "text-gray-300",
    type = "text",
    bgColor = "bg-slate-700",
    className = "",
    placeHolder = "placeholder:text-gray-200",
    labelClass = "",
    ...props
  },
  ref
) {
  const id = useId();
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center">
        {label ? (
          <label
            htmlFor={id}
            className={`inline-block font-semibold ${labelClass} ${labelColor}`}
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`w-full rounded-lg p-2 text-sm ${className} ${textColor} ${bgColor} ${placeHolder}`}
          {...props}
        />
      </div>
    </>
  );
}

export default forwardRef(Input); //when exporting wrap it inside forwardRef.
