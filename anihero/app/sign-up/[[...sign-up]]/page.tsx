import { SignUp } from "@clerk/nextjs"
import Image from "next/image"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-teal-500 to-green-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/placeholder.svg?height=600&width=400"
            alt="Anime background"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 relative z-10">
          Join the Anime World!
        </h1>
        <div className="relative z-10">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-teal-600 hover:bg-teal-700 text-sm normal-case",
                card: "bg-white/80 backdrop-blur-md shadow-none",
                headerTitle: "text-2xl font-bold text-gray-800",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: 
                  "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700",
                socialButtonsBlockButtonText: "font-normal",
                formFieldLabel: "text-gray-700",
                formFieldInput: "border-gray-300 focus:border-teal-500 focus:ring-teal-500",
                footerActionLink: "text-teal-600 hover:text-teal-700"
              },
            }}
          />
        </div>
        <div className="mt-6 text-center relative z-10">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <a href="/sign-in" className="text-teal-600 hover:text-teal-700 ml-1">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}