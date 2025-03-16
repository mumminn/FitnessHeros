import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../constants/routes'

function MainPage() {
  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('/image/background.png')" }}>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1
            className="text-7xl mb-10 font-press-start"
            style={{
              background: "linear-gradient(90deg, #0675C5 0%, #D9CC59 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: "1.2",
            }}
          >
          FITNESS <br /> HEROES
        </h1>
        <Link 
          to={routes.login} 
          className="text-white bg-transparent hover:bg-white hover:text-black border-2 border-white px-10 py-2 rounded-full transition-all duration-300 font-press-start"
        >
          START
        </Link>
      </div>
    </div>
  );
}

export default MainPage;
