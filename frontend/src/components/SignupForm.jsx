import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../App';
import API from '../api';

const SignupForm = ({ isLogin = false }) => {
    const navigate = useNavigate();
    const { login } = React.useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { name, email, password, role } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/auth/login' : '/auth/signup';
        const dataToSend = isLogin ? { email, password } : { name, email, password, role };

        try {
            const res = await API.post(endpoint, dataToSend);
            
            // Success: Login user
            const { token, id, role: userRole } = res.data;
            login(token, id, userRole);

            // Redirect based on role
            if (userRole === 'admin' || userRole === 'recruiter') {
                navigate('/admin');
            } else {
                navigate('/resume');
            }

        } catch (err) {
            console.error('Auth Error:', err.response?.data?.msg || err.message);
            setError(err.response?.data?.msg || `Failed to ${isLogin ? 'log in' : 'sign up'}. Please try again.`);
            toast.error(error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            {error && (
                <p className="mb-4 text-center text-red-600 border border-red-200 bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            {!isLogin && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-200"
                    />
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-200"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-200"
                />
            </div>

            {!isLogin && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">I am signing up as a...</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="role"
                                value="candidate"
                                checked={role === 'candidate'}
                                onChange={handleChange}
                                className="form-radio text-primary ring-primary"
                            />
                            <span className="text-gray-900">Candidate</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="role"
                                value="recruiter"
                                checked={role === 'recruiter'}
                                onChange={handleChange}
                                className="form-radio text-primary ring-primary"
                            />
                            <span className="text-gray-900">Recruiter/Admin</span>
                        </label>
                    </div>
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.01] flex justify-center items-center"
                disabled={loading}
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <span>{isLogin ? 'Login' : 'Signup'}</span>
                )}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <Link to={isLogin ? "/signup" : "/login"} className="font-semibold text-primary hover:text-indigo-700">
                    {isLogin ? "Sign Up" : "Log In"}
                </Link>
            </p>
        </form>
    );
};

export default SignupForm;