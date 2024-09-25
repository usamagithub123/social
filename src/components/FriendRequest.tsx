import prisma from '@/lib/client'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import FriendRequestList from './FriendRequestList'

const FriendRequest = async () => {
  const {userId} = auth();
  if (!userId) return null;
  const requests = await prisma.followRequest.findMany({
    where:{
      receiverId:userId,
    },
    include:{
      sender:true,
    }
  })
  if (requests.length === 0) return null
  return (
    <div className='p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4 '>
      <div className='flex justify-between items-center font-medium' >
         <span className='text-gray-500' >Friend Request</span>
       <Link href="/" className='text-xs text-blue-500 ' >See all</Link>
       </div>

      {
        <FriendRequestList requests={requests} />
      }    
    </div>
  )
}

export default FriendRequest