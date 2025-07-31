import React from "react";
import star from "../../../../../public/seller-star.svg";
import box from "../../../../../public/activePro.svg";
import dollar from "../../../../../public/dollar.svg";
import Image from "next/image";

const MetricCard = () => {
  return (
    <section className=" border border-[#E4E4E7] rounded-lg shadow p-6 max-w-6xl  mx-auto">
      <div>
        <p className="text-gray-500 text-sm">Total Revenue</p>
        <p className="text-4xl font-bold">$26,540.25</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5">
        <div className="flex space-x-4 items-center">
          <Image src={box} alt={"icon"} />
          <div>
            <p className="font-semibold text-sm">Active Products</p>
            <p className="text-[#71717A]">Currently listed</p>
            <p className="text-lg font-bold">45 items</p>
          </div>
        </div>

        <div className="flex space-x-4 items-center">
          <Image src={dollar} alt={"icon"} />
          <div>
            <p className="font-semibold text-sm">Pending Orders</p>
            <p className="text-[#71717A]">Need shipping</p>
            <p className="text-lg font-bold">12 orders</p>
          </div>
        </div>

        <div className="flex space-x-4 items-center">
          <Image src={star} alt={"icon"} />
          <div>
            <p className="font-semibold text-sm">Active Products</p>
            <p className="text-[#71717A]">Customers reviews</p>
            <p className="text-lg font-bold">4.8/5.0</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default MetricCard;
