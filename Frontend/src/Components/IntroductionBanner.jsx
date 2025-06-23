const IntroductionBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to MedChain Connect
        </h1>
        <p className="text-xl mb-8">
          Secure, transparent, and efficient medical record management using blockchain technology
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50">
            Get Started
          </button>
          <button className="border-2 border-white text-white px-6 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-600">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionBanner;
