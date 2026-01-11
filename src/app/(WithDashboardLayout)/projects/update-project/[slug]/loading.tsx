"use client"

const Loader = () => {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="relative w-12 h-12">
          <div className="absolute w-full h-full bg-yellow-400 opacity-75 animate-[spin_1.5s_linear_infinite] transform rotate-45"></div>
          <div className="absolute w-full h-full bg-orange-500 opacity-75 animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      </div>
    );
  };
  
  export default Loader;
  
  