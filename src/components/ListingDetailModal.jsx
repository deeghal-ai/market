import React from 'react';
import {
  X, Car, ArrowLeft, ChevronLeft, ChevronRight, Heart,
  ShoppingCart, MessageSquare, CheckCircle, MapPin,
  Calendar, Palette, Fuel, Settings, Gauge, Users, DoorOpen, Shield
} from 'lucide-react';

const ListingDetailModal = ({ listing, onClose }) => {
  if (!listing) return null;

  // Get condition info - only if condition data exists
  const getConditionInfo = () => {
    const condition = listing.condition?.toLowerCase();
    if (!condition) return null;

    if (condition.includes('new') || condition.includes('like new')) {
      return { text: 'Like New', className: 'bg-green-500 text-white' };
    } else if (condition.includes('excellent')) {
      return { text: 'Excellent', className: 'bg-green-100 text-green-800' };
    } else if (condition.includes('good')) {
      return { text: 'Good', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: listing.condition, className: 'bg-navy text-white' };
  };

  const conditionInfo = getConditionInfo();

  // Calculate price from vehicles
  const minPrice = listing.vehicles?.length > 0
    ? Math.min(...listing.vehicles.map(v => v.price || 0).filter(p => p > 0))
    : 0;
  const maxPrice = listing.vehicles?.length > 0
    ? Math.max(...listing.vehicles.map(v => v.price || 0).filter(p => p > 0))
    : 0;

  // Spec item component
  const SpecItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 text-sm flex-1">{label}</span>
      <span className="font-semibold text-gray-800 text-sm">{value || ''}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-gray-50 w-full max-w-6xl mx-4 rounded-lg shadow-2xl">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vehicle Listings
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image & Specs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="relative bg-gray-200 rounded-xl aspect-video flex items-center justify-center overflow-hidden">
                <Car className="w-24 h-24 text-gray-400" />

                {/* Navigation Arrows */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>

                {/* All Photos Button */}
                <button className="absolute bottom-4 right-4 bg-gray-900/80 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  All Photos
                </button>
              </div>

              {/* Badges Row - only show badges for mapped data */}
              <div className="flex items-center gap-3 flex-wrap">
                {conditionInfo && (
                  <span className={`badge ${conditionInfo.className}`}>
                    {conditionInfo.text}
                  </span>
                )}
                {listing.count > 1 && (
                  <span className="badge bg-green-500 text-white">
                    Bulk Purchase available
                  </span>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Shortlist Button */}
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  Shortlist
                </button>
              </div>

              {/* Vehicle Specification */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Vehicle Specification</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <SpecItem icon={MapPin} label="Regional Specs" value={listing.regionalSpecs} />
                  <SpecItem icon={Calendar} label="Year of Manufacture" value={listing.year} />
                  <SpecItem icon={Car} label="Body Type" value={listing.bodyType} />
                  <SpecItem icon={Shield} label="Condition" value={listing.condition} />
                  <SpecItem icon={Palette} label="Color" value={listing.color} />
                  <SpecItem icon={Fuel} label="Fuel type" value={listing.fuelType} />
                  <SpecItem icon={Settings} label="Transmission" value={listing.transmission} />
                  <SpecItem icon={Gauge} label="Drivetrain" value={listing.drivetrain} />
                  <SpecItem icon={Gauge} label="Engine Size" value={listing.engineSize} />
                  <SpecItem icon={Gauge} label="Horsepower" value={listing.horsepower ? `${listing.horsepower} HP` : null} />
                  <SpecItem icon={Users} label="Seating Capacity" value={listing.seatingCapacity} />
                  <SpecItem icon={DoorOpen} label="Doors" value={listing.doors} />
                </div>
              </div>

              {/* Individual Vehicles */}
              {listing.vehicles?.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Available Units ({listing.vehicles.length})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left p-3 font-medium text-gray-600">VIN</th>
                          <th className="text-left p-3 font-medium text-gray-600">Registration</th>
                          <th className="text-left p-3 font-medium text-gray-600">Mileage</th>
                          <th className="text-left p-3 font-medium text-gray-600">Owners</th>
                          <th className="text-left p-3 font-medium text-gray-600">Warranty</th>
                          <th className="text-left p-3 font-medium text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listing.vehicles.map((vehicle, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs">{vehicle.vin || ''}</td>
                            <td className="p-3">{vehicle.registrationNumber || ''}</td>
                            <td className="p-3">
                              {vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : ''}
                            </td>
                            <td className="p-3">{vehicle.owners || ''}</td>
                            <td className="p-3">{vehicle.warranty || ''}</td>
                            <td className="p-3 font-semibold text-navy">
                              {vehicle.price ? `AED ${Number(vehicle.price).toLocaleString()}` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Price & Actions */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <p className="price-large">
                    {minPrice > 0
                      ? `${minPrice.toLocaleString()} د.إ`
                      : 'Price on Request'
                    }
                  </p>
                  {maxPrice > minPrice && (
                    <p className="price-strikethrough">{maxPrice.toLocaleString()} د.إ</p>
                  )}
                </div>

                <p className="text-gray-700 font-semibold">
                  {listing.year} {listing.make} {listing.model}
                </p>
                {listing.variant && (
                  <p className="text-gray-500 text-sm mt-1">{listing.variant}</p>
                )}
              </div>

              {/* Shipping Options */}
              <div className="shipping-card">
                <h4 className="font-semibold text-gray-800 mb-4">Shipping Options</h4>

                <label>Incoterm</label>
                <select defaultValue="exw">
                  <option value="exw">EXW - Ex Works</option>
                  <option value="fob">FOB - Free on Board</option>
                  <option value="cif">CIF - Cost, Insurance, Freight</option>
                </select>

                <label>Shipping Port</label>
                <select defaultValue="shanghai">
                  <option value="shanghai">Shanghai</option>
                  <option value="dubai">Dubai</option>
                  <option value="singapore">Singapore</option>
                </select>

                <label>Shipping Mode</label>
                <select defaultValue="fcl">
                  <option value="fcl">FCL Container</option>
                  <option value="roro">RoRo</option>
                  <option value="air">Air Freight</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full btn-primary justify-center py-3">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button className="w-full btn-secondary justify-center py-3">
                  <MessageSquare className="w-5 h-5" />
                  Negotiate Price
                </button>
              </div>

              {/* Seller Information - only show if seller data exists */}
              <div className="seller-card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Seller Information</h4>
                </div>

                <p className="seller-name">-</p>
                <p className="seller-address text-gray-400">
                  No seller information available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button (top right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ListingDetailModal;
