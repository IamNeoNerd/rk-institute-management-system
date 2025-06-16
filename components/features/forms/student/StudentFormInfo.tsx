'use client';

export default function StudentFormInfo() {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </span>
        Course & Service Enrollment
      </h4>
      <p className="text-gray-600">
        After creating the student, you can enroll them in courses and services from the student management page.
      </p>
    </div>
  );
}
