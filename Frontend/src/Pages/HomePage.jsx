import { motion } from 'framer-motion';
import heroImage from '../assets/medical-hero.jpg'; // Add your hero image to assets folder

const HomePage = () => {
    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4 lg:px-20">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-xl w-full lg:w-1/2 space-y-6 text-center lg:text-left"
                        >
                            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
                                Revolutionizing Healthcare Records
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100">
                                Secure, transparent, and efficient medical record management powered by blockchain technology
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition duration-300 text-lg"
                                    onClick={() => window.location.href = '/signup'}
                                >
                                    Get Started
                                </button>
                                <button
                                    className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition duration-300 text-lg"
                                >
                                    Learn More
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full lg:w-1/2"
                        >
                            <img
                                src={heroImage}
                                alt="Medical Technology"
                                className="w-full h-auto rounded-2xl shadow-2xl transform transition-transform duration-500 hover:scale-105"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 lg:px-20 bg-gray-50">
                <div className="container mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800"
                    >
                        Why Choose MedChain Connect?
                    </motion.h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition duration-300"
                        >
                            <div className="text-blue-600 mb-4">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">For Patients</h3>
                            <p className="text-gray-600">Complete control over your medical records with secure access management and privacy protection.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition duration-300"
                        >
                            <div className="text-blue-600 mb-4">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">For Providers</h3>
                            <p className="text-gray-600">Streamlined access to patient records with proper authorization and complete audit trail.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition duration-300"
                        >
                            <div className="text-blue-600 mb-4">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Blockchain Security</h3>
                            <p className="text-gray-600">Immutable and transparent record-keeping ensuring data integrity and trust.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 lg:py-20 px-4 lg:px-20 bg-white">
                <div className="container mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-3xl md:text-4xl font-bold text-center mb-10 text-blue-700"
                    >
                        Our Impact
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-8 md:gap-2 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-md transition duration-300"
                        >
                            <h4 className="text-4xl font-extrabold text-blue-600 mb-1">100+</h4>
                            <p className="text-gray-700 font-medium">Healthcare Providers</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-md transition duration-300"
                        >
                            <h4 className="text-4xl font-extrabold text-blue-600 mb-1">10k+</h4>
                            <p className="text-gray-700 font-medium">Patient Records</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-md transition duration-300"
                        >
                            <h4 className="text-4xl font-extrabold text-blue-600 mb-1">99.9%</h4>
                            <p className="text-gray-700 font-medium">Uptime</p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
