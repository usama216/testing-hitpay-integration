// src/actions/auth.ts
"use server"

import { createClient } from "@/auth/server"
import { PhoneNumberUtil } from 'google-libphonenumber'

const phoneUtil = PhoneNumberUtil.getInstance()

function handleError(error: any) {
  console.error('Auth error:', error)
  return {
    errorMessage: error?.message || 'An unexpected error occurred'
  }
}

function isPhoneValid(phone: string): boolean {
  try {
    const parsed = phoneUtil.parseAndKeepRawInput(phone, 'SG')
    return phoneUtil.isValidNumber(parsed)
  } catch {
    return false
  }
}

export const loginAction = async (
  email: string, 
  password: string, 
  userType: 'user' | 'admin',
  captchaToken: string
) => {
  try {
    if (!captchaToken) {
      throw new Error('Please complete the captcha verification')
    }

    const client = await createClient()
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken
      }
    })

    if (error) throw error

    // You could store userType in user metadata if needed
    // await client.auth.updateUser({
    //   data: { userType }
    // })

    return { errorMessage: null, user: data.user }
  } catch (error) {
    return handleError(error)
  }
}

export const signUpAction = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  contactNumber: string,
  memberType: 'student' | 'professional' | 'freelancer',
  captchaToken: string
) => {
  try {
    if (!captchaToken) {
      throw new Error('Please complete the captcha verification')
    }

    if (!isPhoneValid(contactNumber)) {
      throw new Error('Please enter a valid phone number')
    }

    const client = await createClient()

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          contactNumber,
          memberType
        },
        captchaToken
      }
    })

    if (error) throw error

    return { errorMessage: null, user: data.user }
  } catch (error) {
    return handleError(error)
  }
}

export const logOutAction = async () => {
  try {
    const client = await createClient()
    
    const { error } = await client.auth.signOut()
    if (error) throw error

    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}

export const forgotPasswordAction = async (email: string, captchaToken: string) => {
  try {
    if (!captchaToken) {
      throw new Error('Please complete the captcha verification')
    }

    const client = await createClient()
    
    const { error } = await client.auth.resetPasswordForEmail(email, {
      captchaToken,
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
    })

    if (error) throw error

    return { errorMessage: null }
  } catch (error) {
    return handleError(error)
  }
}