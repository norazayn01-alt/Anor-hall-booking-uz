import React from 'react'

function Logo() {
  return (
    <div className='w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-white transition-all duration-300 hover:scale-105'>
      <img src={"/anor.jpg"} alt="anor logosi" className="w-full h-full object-cover"/>
    </div>
  )
}

export default Logo;