'use client';

import React from 'react';
import { AvatarUpload } from './AvatarUpload';
import { BuildingIcon, SparklesIcon } from 'lucide-react';


export function societeData() {
    return (
    <div className="bg-gradient-to-br from-white to-blue-50 w-[1200px] p-12 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <BuildingIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Update Company Information
            </h1>
          </div>
          <form className="grid grid-cols-[300px_1fr] gap-12">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02] duration-300">
                <AvatarUpload />
                <p className="text-sm text-gray-500 text-center mt-4">
                  Upload your company logo or brand image
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <SparklesIcon className="w-4 h-4" />
                  <h3 className="font-medium">Pro Tip</h3>
                </div>
                <p className="text-sm text-blue-600/80">
                  A professional company profile helps build trust with your
                  customers and partners.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input type="text" id="name" name="name" defaultValue="Acme Corporation" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input type="email" id="email" name="email" defaultValue="contact@acme.com" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input type="text" id="phone" name="phone" defaultValue="123-456-7890" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input type="text" id="address" name="address" defaultValue="123 Business Ave, Tech City" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea id="description" name="description" defaultValue="Leading provider of innovative solutions" rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 resize-none" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                  Update Company
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }