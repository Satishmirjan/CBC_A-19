import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import HospitalStatus from '../components/HospitalStatus'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="relative">
        <Banner />
        <div className="absolute -bottom-32 left-0 right-0 z-10">
          <HospitalStatus />
        </div>
      </div>
      <div className="pt-40">
        <SpecialityMenu />
        <TopDoctors />
      </div>
    </div>
  )
}

export default Home