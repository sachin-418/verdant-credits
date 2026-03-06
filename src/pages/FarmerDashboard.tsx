import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, MapPin, Ruler, FlaskConical, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentFarmer,
  getFarmers,
  saveFarmer,
  calculateCarbonCredits,
  generateUniqueId,
  logout,
  type Farmer,
} from "@/lib/storage";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmerPhone, setFarmerPhone] = useState<string | null>(null);
  const [existingFarmer, setExistingFarmer] = useState<Farmer | null>(null);
  const [name, setName] = useState("");
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [step, setStep] = useState<"form" | "result">("form");
  const [credits, setCredits] = useState(0);
  const [uniqueId, setUniqueId] = useState("");

  useEffect(() => {
    const phone = getCurrentFarmer();
    if (!phone) {
      navigate("/farmer-login");
      return;
    }
    setFarmerPhone(phone);
    const existing = getFarmers().find(f => f.phone === phone && !f.sold);
    if (existing) {
      setExistingFarmer(existing);
      setStep("result");
      setCredits(existing.carbonCredits);
      setUniqueId(existing.uniqueId);
    }
  }, [navigate]);

  const handleCalculate = () => {
    if (!name || !n || !p || !k || !farmSize || !lat || !lng) {
      toast.error("Please fill all fields");
      return;
    }

    const npk = { n: parseFloat(n), p: parseFloat(p), k: parseFloat(k) };
    const size = parseFloat(farmSize);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const calculatedCredits = calculateCarbonCredits(npk, size);
    const uid = generateUniqueId(latitude, longitude);

    const farmer: Farmer = {
      id: `${farmerPhone}-${Date.now()}`,
      name,
      phone: farmerPhone!,
      npk,
      farmSize: size,
      lat: latitude,
      lng: longitude,
      carbonCredits: calculatedCredits,
      uniqueId: uid,
      listed: false,
      sold: false,
      createdAt: new Date().toISOString(),
    };

    saveFarmer(farmer);
    setCredits(calculatedCredits);
    setUniqueId(uid);
    setExistingFarmer(farmer);
    setStep("result");
    toast.success(`🎉 Carbon credits calculated: ${calculatedCredits} credits!`);
  };

  const handleListToMarket = () => {
    if (existingFarmer) {
      const updated = { ...existingFarmer, listed: true };
      saveFarmer(updated);
      setExistingFarmer(updated);
      toast.success("✅ Credits listed on marketplace! Buyers can now purchase your credits.");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="min-h-screen bg-background bg-mesh p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Farmer Dashboard</h1>
              <p className="text-muted-foreground text-xs">{farmerPhone}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="glass rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {step === "form" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-6 md:p-8"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-6">Register Your Farm</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Farmer Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputClass} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                  <FlaskConical className="w-3 h-3" /> NPK Values (Soil Test)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" value={n} onChange={e => setN(e.target.value)} placeholder="N" className={inputClass} />
                  <input type="number" value={p} onChange={e => setP(e.target.value)} placeholder="P" className={inputClass} />
                  <input type="number" value={k} onChange={e => setK(e.target.value)} placeholder="K" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Farm Size (acres)
                </label>
                <input type="number" value={farmSize} onChange={e => setFarmSize(e.target.value)} placeholder="e.g. 5" className={inputClass} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location (Latitude & Longitude)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className={inputClass} />
                  <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" className={inputClass} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCalculate}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold glow-primary transition-all mt-2"
              >
                Calculate Carbon Credits
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Credit Card */}
            <div className="glass-strong rounded-2xl p-6 md:p-8 text-center">
              <p className="text-muted-foreground text-sm mb-2">Your Carbon Credits</p>
              
              {/* Rotating coin */}
              <div className="flex justify-center my-6" style={{ perspective: "400px" }}>
                <div className="coin-rotate w-24 h-24 rounded-full flex items-center justify-center pulse-glow"
                  style={{
                    background: "linear-gradient(135deg, hsl(50, 95%, 70%), hsl(45, 90%, 55%), hsl(38, 80%, 40%))",
                  }}
                >
                  <span className="font-display font-bold text-2xl" style={{ color: "hsl(160, 30%, 6%)" }}>
                    {credits}
                  </span>
                </div>
              </div>

              <h2 className="font-display text-3xl font-bold text-gradient-gold">{credits} Credits</h2>
              <p className="text-muted-foreground text-sm mt-2">Unique ID: <span className="text-primary font-mono">{uniqueId}</span></p>
              
              {existingFarmer?.listed ? (
                <div className="mt-4 flex items-center justify-center gap-2 text-primary">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Listed on Marketplace</span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleListToMarket}
                  className="mt-6 bg-accent text-accent-foreground rounded-lg px-8 py-3 font-semibold glow-gold transition-all"
                >
                  List on Marketplace
                </motion.button>
              )}
            </div>

            {/* Details */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Farm Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="text-foreground font-medium">{existingFarmer?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Farm Size</p>
                  <p className="text-foreground font-medium">{existingFarmer?.farmSize} acres</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NPK</p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.npk.n}-{existingFarmer?.npk.p}-{existingFarmer?.npk.k}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.lat.toFixed(2)}, {existingFarmer?.lng.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
