import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          Beauty Booking Pro
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          探索頂級美容護膚服務，隨時隨地預約您的專屬時段。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/services"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            瀏覽服務
          </Link>
          <Link
            to="/my-bookings"
            className="px-8 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            我的預約
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
