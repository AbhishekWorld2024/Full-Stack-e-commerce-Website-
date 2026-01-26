import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen" data-testid="about-page">
      <div className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">About Us</h1>
          <p className="text-gray-600">Learn more about our fashion store.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose max-w-none">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-6">
            FashionStore was founded with a simple mission: to provide quality clothing 
            at affordable prices. We believe everyone deserves to look and feel their best.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Our Values</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Quality materials and craftsmanship</li>
            <li>Affordable pricing for everyone</li>
            <li>Excellent customer service</li>
            <li>Fast and reliable shipping</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-6">
            Have questions? Reach out to us at support@fashionstore.com
          </p>

          <div className="mt-8">
            <Link 
              to="/shop" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Browse Our Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
