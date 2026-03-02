import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, User, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const InputField = ({ id, label, icon: Icon, type = 'text', value, onChange, placeholder, error }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#a1a1aa] mb-2">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="input-luxe"
        placeholder={placeholder}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 text-sm text-rose-400 flex items-center gap-1.5"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        {error}
      </motion.p>
    )}
  </div>
);

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    adminPasscode: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'admin' && !formData.adminPasscode) {
      newErrors.adminPasscode = 'Admin Access Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      adminPasscode: formData.adminPasscode
    });

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Account created!",
        description: "Welcome to CodeMaster. Let's start coding!",
      });
      navigate('/');
    } else {
      toast({
        title: "Registration failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setErrors({ submit: result.error });
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - CodeMaster</title>
        <meta name="description" content="Create your CodeMaster account and start solving coding challenges today." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Floating gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              y: [0, -25, 0],
              scale: [1, 1.1, 1],
              opacity: [0.12, 0.22, 0.12]
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] w-80 h-80 bg-amber-500/15 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              opacity: [0.08, 0.18, 0.08]
            }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[15%] left-[10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-5 shadow-glow-amber"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Code2 className="w-8 h-8 text-black" />
            </motion.div>
            <h1 className="text-3xl font-bold text-[#f4f4f5] mb-2">Create Account</h1>
            <p className="text-[#52525b]">Join our community of developers</p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                id="username"
                label="Username"
                icon={User}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
                error={errors.username}
              />

              <InputField
                id="email"
                label="Email Address"
                icon={Mail}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                error={errors.email}
              />

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  I am a...
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] z-10" />
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="w-full bg-[#0f0f12] text-[#d4d4d8] border border-[#3f3f46]/50 rounded-xl pl-11 pr-4 py-6 focus:outline-none focus:border-amber-500/50 transition-all duration-300">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-[#3f3f46]/50 text-[#d4d4d8] rounded-xl">
                      <SelectItem value="user">Student / Developer</SelectItem>
                      <SelectItem value="admin">Admin / Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Access Code Field (Conditional) */}
              {formData.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <InputField
                    id="adminPasscode"
                    label="Admin Access Code"
                    icon={Lock}
                    type="password"
                    value={formData.adminPasscode}
                    onChange={(e) => setFormData({ ...formData, adminPasscode: e.target.value })}
                    placeholder="Enter Admin Access Code"
                    error={errors.adminPasscode}
                  />
                </motion.div>
              )}

              <InputField
                id="password"
                label="Password"
                icon={Lock}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 characters"
                error={errors.password}
              />

              <InputField
                id="confirmPassword"
                label="Confirm Password"
                icon={Lock}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
              />

              {/* Submit Error */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"
                >
                  <p className="text-sm text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-[#52525b] text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default SignupPage;