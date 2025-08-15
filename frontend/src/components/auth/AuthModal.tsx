// src/components/auth/AuthModal.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { User, Mail, Lock, Eye, EyeOff, Phone, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { PhoneInput } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber'

import HCaptcha from '@hcaptcha/react-hcaptcha'


import 'react-international-phone/style.css';



// Types
interface LoginData {
  email: string
  password: string
  userType: 'user' | 'admin'
  rememberMe: boolean
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  contactNumber: string
  memberType: 'student' | 'professional' | 'freelancer'
  verificationDocument?: File
  acceptedTerms: boolean
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultTab?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, onSuccess, defaultTab = 'login' }: AuthModalProps) {
  const router = useRouter()

  // State to hold the token
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const hcaptchaRef = useRef<HCaptcha>(null)
  // state hooks unchanged 
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [signupStep, setSignupStep] = useState(1)
  // const [captchaCompleted, setCaptchaCompleted] = useState(false)
  const [error, setError] = useState('')

  const [loginData, setLoginData]   = useState<LoginData>({ 
    email: '', password: '', userType: 'user', rememberMe: false 
  })
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    memberType: 'professional',
    acceptedTerms: false
  })
  const [phoneTouched, setPhoneTouched] = useState(false)
  const phoneUtil = PhoneNumberUtil.getInstance()
  const isPhoneValid = (phone: string): boolean => {
    try {
      const parsed = phoneUtil.parseAndKeepRawInput(phone, 'SG')
      return phoneUtil.isValidNumber(parsed)
    } catch {
      return false
    }
  }

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')

  // ────────────────────────────────────────────────────
  // HANDLE LOGIN
  // ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!captchaToken) {
      setError('Please complete the captcha')
      setIsLoading(false)
      return
    }

    // if (!captchaCompleted) {
    //   setError('Please complete the captcha')
    //   setIsLoading(false)
    //   return
    // }
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    // **Supabase login** with HCaptcha token
    const { data, error: signInError } = 
      await supabase.auth.signInWithPassword({
        email: loginData.email, 
        password: loginData.password,   // credentials
        options: {
          captchaToken
        } // options
      })

    if (signInError) {
      setError(signInError.message)
    } else {
      // logged in
      // reset HCaptcha for next time
      hcaptchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
      console.log('Supabase user:', data.user)
      onSuccess?.()
      onClose()
      // optionally redirect:
      // router.push('/dashboard')
    }
    setIsLoading(false)
  }

  // ────────────────────────────────────────────────────
  // BASIC SIGNUP (Step 1 validation only)
  // ────────────────────────────────────────────────────
  const handleBasicSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!captchaToken) {
      setError('Please complete the captcha')
      return
    }

    // … the existing validations …
    if (!signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError('Please fill in all required fields')
      return
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (!signupData.acceptedTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setSignupStep(2)
  }

  // ────────────────────────────────────────────────────
  // FULL SIGNUP (Step 2 → call Supabase)
  // ────────────────────────────────────────────────────
  const handleFullSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // if (!captchaCompleted) {
    //   setError('Please complete the captcha')
    //   setIsLoading(false)
    //   return
    // }
    if (!captchaToken) {
      setError('Please complete the captcha')
      setIsLoading(false)
      return
    }
    // … your extra field validations …
    if (!signupData.firstName || !signupData.lastName || !signupData.contactNumber) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }
    if (signupData.memberType === 'student' && !signupData.verificationDocument) {
      setError('Students must upload a verification document')
      setIsLoading(false)
      return
    }
    if (!isPhoneValid(signupData.contactNumber)) {
      setError('Please enter a valid phone number')
      setIsLoading(false)
      return
    }

    // **Supabase signup** (with user_metadata)(with HCaptcha token & metadata)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          contactNumber: signupData.contactNumber,
          memberType: signupData.memberType
        },
        captchaToken
      }
        
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      hcaptchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
      console.log('Signup success, confirmation email sent to:', signupData.email)
      alert(
        signupData.memberType === 'student'
          ? 'Please check your email to confirm your account. We’ll verify your student status manually.'
          : 'Please check your email to confirm your account.'
      )
      onSuccess?.()
      onClose()
    }
    setIsLoading(false)
  }

  // ────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!forgotPasswordEmail) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    if (!captchaToken) {
    setError('Please complete the captcha')
    setIsLoading(false)
    return
  }

    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(
      forgotPasswordEmail,
      { captchaToken }
    )
    if (resetError) {
      setError(resetError.message)
    } else {
      alert(`Password reset email sent to ${forgotPasswordEmail}! Check your inbox.`)
      // clear & reset
      hcaptchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
      setShowForgotPassword(false)
    }
    setIsLoading(false)
  }

  // ────────────────────────────────────────────────────
  // RESET MODAL STATE ON CLOSE
  // ────────────────────────────────────────────────────
  const handleClose = () => {
    setActiveTab(defaultTab)
    setSignupStep(1)
    setShowForgotPassword(false)
    setError('')
    // setCaptchaCompleted(false)
    setCaptchaToken(null)
    hcaptchaRef.current?.resetCaptcha()
    setPhoneTouched(false)
    onClose()
  }

  // // Mock captcha component
  // const MockCaptcha = () => (
  //   <div className="bg-gray-50 border rounded-md p-4 text-center">
  //     <div className="flex items-center justify-center space-x-2 mb-2">
  //       <div className="w-4 h-4 bg-blue-500 rounded"></div>
  //       <span className="text-sm text-gray-600">I'm not a robot</span>
  //     </div>
  //     <Button
  //       type="button"
  //       variant="outline"
  //       size="sm"
  //       onClick={() => setCaptchaCompleted(!captchaCompleted)}
  //       className={`${captchaCompleted ? 'bg-green-100 text-green-700' : ''}`}
  //     >
  //       {captchaCompleted ? '✓ Verified' : 'Click to verify (Demo)'}
  //     </Button>
  //   </div>
  // )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {showForgotPassword ? 'Reset Password' : 'Welcome to CoWork@mps-Kovan'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {showForgotPassword ? (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <HCaptcha
                      // sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                      ref = {hcaptchaRef}
                      sitekey='6b98d826-fc00-433a-8c5a-1198ebd2189e'
                      onVerify={setCaptchaToken}
                      onError={err => console.error('hCaptcha error:: ', err)}
                    />
            <div>
              <Label htmlFor="forgot-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                // disabled={isLoading}
                disabled={isLoading || !captchaToken}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </div>
          </form>
        ) : (
          // Main Auth Tabs
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Captcha */}
                  {/* <MockCaptcha /> */}
                   {/* hCaptcha widget */}
                  <HCaptcha
                    // sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                    ref = {hcaptchaRef}
                    sitekey='6b98d826-fc00-433a-8c5a-1198ebd2189e'
                    onVerify={setCaptchaToken}
                    onError={err => console.error('hCaptcha error:: ', err)}
                  />

                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password (try 'wrong' to see error)"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="user-type">Login As</Label>
                    <Select
                      value={loginData.userType}
                      onValueChange={(value: 'user' | 'admin') => setLoginData({ ...loginData, userType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: !!checked })}
                    />
                    <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !captchaToken}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </TabsContent>

              {/* SIGNUP TAB */}
              <TabsContent value="signup">
                {signupStep === 1 ? (
                  // Step 1: Basic Info (with hCaptcha check)
                  <form onSubmit={handleBasicSignup} className="space-y-4">
                    {/* Captcha */}
                    {/* <MockCaptcha /> */}
                    {/* hCaptcha widget */}
                    <HCaptcha
                      // sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                      ref = {hcaptchaRef}
                      sitekey='6b98d826-fc00-433a-8c5a-1198ebd2189e'
                      onVerify={setCaptchaToken}
                      onError={err => console.error('hCaptcha error:: ', err)}
                    />
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accept-terms"
                        checked={signupData.acceptedTerms}
                        onCheckedChange={(checked) => setSignupData({ ...signupData, acceptedTerms: !!checked })}
                      />
                      <Label htmlFor="accept-terms" className="text-sm">
                        I have read and accept the{' '}
                        <a href="/terms" target="_blank" className="text-orange-600 hover:underline">
                          Terms and Conditions
                        </a>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !captchaToken}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Continue
                    </Button>
                  </form>
                ) : (
                  // Step 2: Detailed Form
                  <form onSubmit={handleFullSignup} className="space-y-4">
                    {/* Captcha */}
                    {/* <MockCaptcha /> */}
                    {/* hCaptcha widget */}
                    <HCaptcha
                      // sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                      ref = {hcaptchaRef}
                      sitekey='6b98d826-fc00-433a-8c5a-1198ebd2189e'
                      onVerify={setCaptchaToken}
                      onError={err => console.error('hCaptcha error:: ', err)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        value={signupData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value="••••••••"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-number">Contact Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        {/* <Input
                          id="contact-number"
                          type="tel"
                          placeholder="+65 XXXX XXXX"
                          value={signupData.contactNumber}
                          onChange={(e) => setSignupData({...signupData, contactNumber: e.target.value})}
                          className="pl-10"
                          required
                        /> */}
                        <PhoneInput
                          id="contact-number"
                          defaultCountry="sg"
                          value={signupData.contactNumber}
                          onChange={(value) => {
                            setSignupData({ ...signupData, contactNumber: value })
                            setPhoneTouched(true)
                          }}
                          onFocus={() => setPhoneTouched(true)}
                          placeholder="Enter phone number"
                          inputProps={{
                          id: 'contact-number',
                          name: 'contactNumber',
                          required: true,
                          className: 'pl-10',
                        }}
                        />
                      </div>
                      {phoneTouched && signupData.contactNumber && !isPhoneValid(signupData.contactNumber) && (
                        <p className="mt-1 text-sm text-red-600">
                          Please enter a valid phone number.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="member-type">Member Type</Label>
                      <Select
                        value={signupData.memberType}
                        onValueChange={(value: 'student' | 'professional' | 'freelancer') =>
                          setSignupData({ ...signupData, memberType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {signupData.memberType === 'student' && (
                      <div>
                        <Label htmlFor="verification-doc">Verification Document *</Label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="verification-doc"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => setSignupData({
                              ...signupData,
                              verificationDocument: e.target.files?.[0]
                            })}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload student ID or enrollment certificate for manual verification
                        </p>
                      </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                      <p><strong>Account Creation Summary:</strong></p>
                      <p>• Email: {signupData.email}</p>
                      <p>• Member Type: {signupData.memberType}</p>
                      {signupData.memberType === 'student' && (
                        <p>• Manual verification required for student status</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignupStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        // disabled={isLoading || !captchaCompleted || !isPhoneValid(signupData.contactNumber)}
                        // disabled={isLoading || !!captchaToken || !isPhoneValid(signupData.contactNumber)}
                        disabled={
                          isLoading ||
                          !captchaToken ||
                          (signupStep===2 && !isPhoneValid(signupData.contactNumber))
                        }
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                onSuccess?.()
                onClose()
              }}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}