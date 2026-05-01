// src/pages/public/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@components/common/Button';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Our Theatre</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A premier destination for cinema lovers with state-of-the-art facilities and the latest movie releases.
          </p>
        </div>

        {/* Our Story Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img 
                  className="h-48 w-full object-cover md:h-full md:w-64" 
                  src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                  alt="Movie theatre interior" 
                />
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Founded in 2010, our theatre has been dedicated to providing the ultimate movie-going experience. What started as a small single-screen theatre has now grown into a multi-screen complex with cutting-edge technology and premium amenities.
                </p>
                <p className="text-gray-600">
                  Our mission is to create a welcoming environment where movie enthusiasts can immerse themselves in the magic of cinema, enjoying the latest blockbusters and timeless classics alike.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Makes Us Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Premium Screens</h3>
              <p className="text-gray-600 text-center">
                Our state-of-the-art screens provide crystal clear picture quality and immersive viewing experiences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Dolby Atmos Sound</h3>
              <p className="text-gray-600 text-center">
                Experience movies with breathtaking sound that flows all around you, even overhead.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Luxury Seating</h3>
              <p className="text-gray-600 text-center">
                Relax in our comfortable recliner seats with ample legroom and personal space.
              </p>
            </div>
          </div>
        </section>

        {/* Our Theatres Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Theatres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                className="h-48 w-full object-cover" 
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                alt="Downtown Theatre" 
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Downtown Theatre</h3>
                <p className="text-gray-600 mb-4">
                  Located in the heart of the city, our flagship theatre features 10 screens with the latest technology.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Main Street, Anytown</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                className="h-48 w-full object-cover" 
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                alt="Westside Cinema" 
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Westside Cinema</h3>
                <p className="text-gray-600 mb-4">
                  Our newest location featuring 8 screens including 2 IMAX theatres and premium dining options.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>456 West Avenue, Anytown</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">What are your operating hours?</h3>
              <p className="text-gray-600">
                We are open daily from 10:00 AM to 12:00 AM. Box office opens 30 minutes before the first show and closes 30 minutes after the last show starts.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I book tickets online?</h3>
              <p className="text-gray-600">
                Yes, you can book tickets through our website or mobile app. Online booking opens 7 days in advance for all shows.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Do you offer any discounts?</h3>
              <p className="text-gray-600">
                We offer special discounts for students, seniors, and military personnel with valid ID. We also have special rates for matinee shows before 6:00 PM.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">What's your refund policy?</h3>
              <p className="text-gray-600">
                Tickets can be refunded or exchanged up to 2 hours before the show time. After that, tickets are non-refundable but may be exchanged for a different show on the same day, subject to availability.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-primary-50 rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience the Magic of Cinema?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join us for an unforgettable movie experience. Check out the latest releases and book your tickets today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/movies">
                <Button variant="primary" size="lg">
                  Browse Movies
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;