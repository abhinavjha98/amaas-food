export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Ammas Food</h3>
            <p className="text-gray-400">
              Connecting you with authentic home-cooked meals from local chefs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/catalog" className="hover:text-white">Browse Dishes</a></li>
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Chefs</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/register?role=producer" className="hover:text-white">Become a Chef</a></li>
              <li><a href="/producer/guide" className="hover:text-white">Chef Guide</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2025 Ammas Food. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}




