// // src/components/debug/ApiDebugger.jsx
// import { useState } from 'react';
// import Button from '../common/Button';
// import Input from '../common/Input';

// const ApiDebugger = () => {
//   const [screeningId, setScreeningId] = useState('');
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Test getting screening details
//   const testGetScreening = async () => {
//     if (!screeningId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`/api/screenings/${screeningId}`);
//       const data = await response.json();
      
//       setResults({
//         endpoint: `/api/screenings/${screeningId}`,
//         status: response.status,
//         data
//       });
//     } catch (err) {
//       setError(`Error fetching screening: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Test getting seating layout
//   const testGetLayout = async () => {
//     if (!screeningId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`/api/screenings/${screeningId}/layout`);
//       const data = await response.json();
      
//       setResults({
//         endpoint: `/api/screenings/${screeningId}/layout`,
//         status: response.status,
//         data
//       });
//     } catch (err) {
//       setError(`Error fetching layout: ${err.message}`);
      
//       // Try alternative endpoint
//       try {
//         const screening = await fetch(`/api/screenings/${screeningId}`);
//         const screeningData = await screening.json();
        
//         if (screeningData.data?.theatreId && screeningData.data?.screenNumber) {
//           const { theatreId, screenNumber } = screeningData.data;
//           const altResponse = await fetch(`/api/admin/seats/theatre/${theatreId}/screen/${screenNumber}`);
//           const altData = await altResponse.json();
          
//           setResults({
//             endpoint: `/api/admin/seats/theatre/${theatreId}/screen/${screenNumber}`,
//             status: altResponse.status,
//             data: altData,
//             note: "Used alternative endpoint after primary endpoint failed"
//           });
//           setError(null);
//         }
//       } catch (altErr) {
//         setError(`Both endpoints failed: ${err.message} / ${altErr.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Test getting booked seats
//   const testGetBookedSeats = async () => {
//     if (!screeningId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`/api/screenings/${screeningId}/booked-seats`);
//       const data = await response.json();
      
//       setResults({
//         endpoint: `/api/screenings/${screeningId}/booked-seats`,
//         status: response.status,
//         data
//       });
//     } catch (err) {
//       setError(`Error fetching booked seats: ${err.message}`);
      
//       // Try alternative endpoint
//       try {
//         const altResponse = await fetch(`/api/bookings/screening/${screeningId}/seats`);
//         const altData = await altResponse.json();
        
//         results.tests.push({
//           name: "Get Booked Seats (Alt)",
//           endpoint: `/api/bookings/screening/${screeningId}/seats`,
//           status: altResponse.status,
//           success: altResponse.ok,
//           data: altData
//         });
//       } catch (altErr) {
//         results.tests.push({
//           name: "Get Booked Seats (Alt)",
//           success: false,
//           error: altErr.message
//         });
//       }
//     }
    
//     // Test 4: Calculate price
//     try {
//       const response = await fetch(`/api/bookings/calculate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           screeningId,
//           selectedSeats: ['A1', 'A2'] // Test with two sample seats
//         })
//       });
//       const data = await response.json();
      
//       results.tests.push({
//         name: "Calculate Price",
//         endpoint: `/api/bookings/calculate`,
//         method: 'POST',
//         payload: { screeningId, selectedSeats: ['A1', 'A2'] },
//         status: response.status,
//         success: response.ok,
//         data
//       });
//     } catch (err) {
//       results.tests.push({
//         name: "Calculate Price",
//         endpoint: `/api/bookings/calculate`,
//         method: 'POST',
//         success: false,
//         error: err.message
//       });
//     }
    
//     setResults(results);
//     setLoading(false);
//   };
  
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//       <h2 className="text-xl font-bold mb-4">API Debugger</h2>
      
//       <div className="mb-6">
//         <Input
//           label="Screening ID"
//           placeholder="Enter screening ID"
//           value={screeningId}
//           onChange={(e) => setScreeningId(e.target.value)}
//         />
//         <p className="text-sm text-gray-500 mt-1">
//           Enter a screening ID to test API endpoints (e.g., 23)
//         </p>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
//         <Button 
//           variant="primary" 
//           onClick={testGetScreening} 
//           disabled={!screeningId || loading}
//           loading={loading}
//         >
//           Test Get Screening
//         </Button>
        
//         <Button 
//           variant="primary" 
//           onClick={testGetLayout} 
//           disabled={!screeningId || loading}
//           loading={loading}
//         >
//           Test Get Layout
//         </Button>
        
//         <Button 
//           variant="primary" 
//           onClick={testGetBookedSeats} 
//           disabled={!screeningId || loading}
//           loading={loading}
//         >
//           Test Get Booked Seats
//         </Button>
        
//         <Button 
//           variant="primary" 
//           onClick={testCalculatePrice} 
//           disabled={!screeningId || loading}
//           loading={loading}
//         >
//           Test Calculate Price
//         </Button>
        
//         <Button 
//           variant="primary" 
//           onClick={testCreateBooking} 
//           disabled={!screeningId || loading}
//           loading={loading}
//         >
//           Test Create Booking
//         </Button>
        
//         <Button 
//           variant="secondary" 
//           onClick={testAllEndpoints} 
//           disabled={!screeningId || loading}
//           loading={loading}
//           className="md:col-span-2"
//         >
//           Test All Endpoints
//         </Button>
//       </div>
      
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
//           <h3 className="font-bold mb-2">Error</h3>
//           <p>{error}</p>
//         </div>
//       )}
      
//       {results && (
//         <div className="mt-6">
//           <h3 className="font-bold mb-2">Results</h3>
//           <div className="bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto max-h-96">
//             <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
//               {JSON.stringify(results, null, 2)}
//             </pre>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApiDebugger;screeningId}/seats`);
//         const altData = await altResponse.json();
        
//         setResults({
//           endpoint: `/api/bookings/screening/${screeningId}/seats`,
//           status: altResponse.status,
//           data: altData,
//           note: "Used alternative endpoint after primary endpoint failed"
//         });
//         setError(null);
//       } catch (altErr) {
//         setError(`Both endpoints failed: ${err.message} / ${altErr.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Test price calculation
//   const testCalculatePrice = async () => {
//     if (!screeningId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`/api/bookings/calculate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           screeningId,
//           selectedSeats: ['A1', 'A2'] // Test with two sample seats
//         })
//       });
//       const data = await response.json();
      
//       setResults({
//         endpoint: `/api/bookings/calculate`,
//         method: 'POST',
//         payload: { screeningId, selectedSeats: ['A1', 'A2'] },
//         status: response.status,
//         data
//       });
//     } catch (err) {
//       setError(`Error calculating price: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Test create booking (no actual booking created)
//   const testCreateBooking = async () => {
//     if (!screeningId) return;
    
//     setLoading(true);
//     setError(null);
    
//     // Just simulate - don't actually create a booking
//     setResults({
//       endpoint: `/api/bookings`,
//       method: 'POST',
//       payload: { 
//         screeningId, 
//         bookedSeats: ['A3', 'A4'],
//         paymentMethod: 'Credit Card'
//       },
//       note: "This is a simulation - no actual booking was created"
//     });
//     setLoading(false);
//   };
  
//   // Test full API compatibility
//   const testAllEndpoints = async () => {
//     if (!screeningId) return;
    
//     setLoading(true);
//     setError(null);
    
//     const results = {
//       screeningId,
//       tests: []
//     };
    
//     // Test 1: Get screening
//     try {
//       const response = await fetch(`/api/screenings/${screeningId}`);
//       const data = await response.json();
      
//       results.tests.push({
//         name: "Get Screening",
//         endpoint: `/api/screenings/${screeningId}`,
//         status: response.status,
//         success: response.ok,
//         data
//       });
//     } catch (err) {
//       results.tests.push({
//         name: "Get Screening",
//         endpoint: `/api/screenings/${screeningId}`,
//         success: false,
//         error: err.message
//       });
//     }
    
//     // Test 2: Get layout
//     try {
//       const response = await fetch(`/api/screenings/${screeningId}/layout`);
//       const data = await response.json();
      
//       results.tests.push({
//         name: "Get Layout",
//         endpoint: `/api/screenings/${screeningId}/layout`,
//         status: response.status,
//         success: response.ok,
//         data
//       });
//     } catch (err) {
//       results.tests.push({
//         name: "Get Layout",
//         endpoint: `/api/screenings/${screeningId}/layout`,
//         success: false,
//         error: err.message
//       });
      
//       // Try alternative endpoint
//       try {
//         const screening = await fetch(`/api/screenings/${screeningId}`);
//         const screeningData = await screening.json();
        
//         if (screeningData.data?.theatreId && screeningData.data?.screenNumber) {
//           const { theatreId, screenNumber } = screeningData.data;
//           const altResponse = await fetch(`/api/admin/seats/theatre/${theatreId}/screen/${screenNumber}`);
//           const altData = await altResponse.json();
          
//           results.tests.push({
//             name: "Get Layout (Alt)",
//             endpoint: `/api/admin/seats/theatre/${theatreId}/screen/${screenNumber}`,
//             status: altResponse.status,
//             success: altResponse.ok,
//             data: altData
//           });
//         }
//       } catch (altErr) {
//         results.tests.push({
//           name: "Get Layout (Alt)",
//           success: false,
//           error: altErr.message
//         });
//       }
//     }
    
//     // Test 3: Get booked seats
//     try {
//       const response = await fetch(`/api/screenings/${screeningId}/booked-seats`);
//       const data = await response.json();
      
//       results.tests.push({
//         name: "Get Booked Seats",
//         endpoint: `/api/screenings/${screeningId}/booked-seats`,
//         status: response.status,
//         success: response.ok,
//         data
//       });
//     } catch (err) {
//       results.tests.push({
//         name: "Get Booked Seats",
//         endpoint: `/api/screenings/${screeningId}/booked-seats`,
//         success: false,
//         error: err.message
//       });
      
//       // Try alternative endpoint
//       try {
//         const altResponse = await fetch(`/api/bookings/screening/${