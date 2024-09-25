import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (   
  <div className='h-[calc(100vh-96px)] flex items-center justify-center mt-12 mb-2  ' >
      <SignIn />
  </div>
  )
}