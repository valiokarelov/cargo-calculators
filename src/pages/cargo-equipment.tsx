import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Plane, 
  Package, 
  Ship, 
  Container, 
  Search,
  X 
} from 'lucide-react';

interface EquipmentSpecs {
  [key: string]: string;
}

interface Equipment {
  name: string;
  fullName: string;
  type: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  specs?: EquipmentSpecs;
}

interface EquipmentData {
  aircraft: Equipment[];
  airPallets: Equipment[];
  seaVessels: Equipment[];
  seaContainers: Equipment[];
}

const CargoEquipmentCatalog = () => {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(false);

    const equipmentData: EquipmentData = {
    aircraft: [
      {
        name: "727-200F",
        fullName: "727-200F (Main Deck)",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "60,000 kg",
          cargoVolume: "5,820 m³",
          totalULDs: "12 ULDs",
          uldType1: "12 x PAG/P1P - (727-200F)",
          uldDimensions1: "88.2\" x 124.8\" x 79.5\"",
          uldPayload1: "5,000 kg",
          uldTare1: "100 kg",
          topContours: "Front: 37.8\" x 36.2\", Rear: 37.8\" x 36.2\""
        }
      },
      {
        name: "737-300F",
        fullName: "737-300F (Main Deck)",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "45,000 kg",
          cargoVolume: "4,241 m³",
          totalULDs: "9 ULDs (2 types)",
          uldType1: "8 x PAG/P1P - (737-300F)",
          uldDimensions1: "88.2\" x 124.8\" x 78\"",
          uldPayload1: "5,000 kg",
          uldTare1: "100 kg",
          uldType2: "1 x PAG/P1P - LD-7",
          uldDimensions2: "88.2\" x 124.8\" x 64.2\"",
          uldPayload2: "5,000 kg",
          uldTare2: "100 kg",
          topContours: "37\" x 30.7\" (front/rear)"
        }
      },
      {
        name: "737-400F",
        fullName: "737-400F (Main Deck)",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "55,000 kg",
          cargoVolume: "5,199 m³",
          totalULDs: "11 ULDs (2 types)",
          uldType1: "10 x PAG/P1P - (737-300F, 400F)",
          uldDimensions1: "88.2\" x 124.8\" x 78\"",
          uldPayload1: "5,000 kg",
          uldTare1: "100 kg",
          uldType2: "1 x PAG/P1P - LD-7",
          uldDimensions2: "88.2\" x 124.8\" x 64.2\"",
          uldPayload2: "5,000 kg",
          uldTare2: "100 kg",
          topContours: "37\" x 30.7\" (front/rear)"
        }
      },
      {
        name: "747-400BCF",
        fullName: "747-400BCF",
        type: "Boeing Converted Freighter",
        icon: Plane,
        specs: {
          defaultPayload: "190,874 kg",
          cargoVolume: "27,811 m³",
          totalULDs: "42 ULDs (7 types)",
          uldType1: "9 x PMC/P6P - LD",
          uldDimensions1: "124.8\" x 96.1\" x 64\"",
          uldPayload1: "5,035 kg",
          uldTare1: "120 kg",
          uldType2: "1 x PMC/P6P - Q6 (A1 position)",
          uldDimensions2: "124.8\" x 96.1\" x 96.1\"",
          uldPayload2: "5,000 kg",
          uldType3: "1 x PMC/P6P - Q6 (A2 position)",
          uldDimensions3: "124.8\" x 96.1\" x 96.1\"",
          uldPayload3: "5,000 kg",
          uldType4: "7 x PMC/P6P - Q6",
          uldDimensions4: "124.8\" x 96.1\" x 88.2\"",
          uldPayload4: "4,250 kg",
          uldType5: "21 x P6P Q7 (B747F)",
          uldDimensions5: "124.8\" x 96.1\" x 117.7\"",
          uldPayload5: "4,819 kg",
          uldType6: "2 x PYB - Q7 (B747F)",
          uldDimensions6: "96.1\" x 54.7\" x 118.1\"",
          uldPayload6: "1,511 kg",
          uldType7: "1 x 747-400F Bulk Compartment",
          uldDimensions7: "129.9\" x 118.1\" x 63.8\"",
          uldPayload7: "1,588 kg"
        }
      },
      {
        name: "747-400F",
        fullName: "747-400F",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "185,800 kg",
          cargoVolume: "27,741 m³",
          totalULDs: "41 ULDs (6 types)",
          uldType1: "9 x PMC/P6P - LD",
          uldDimensions1: "124.8\" x 96.1\" x 64\"",
          uldPayload1: "5,035 kg",
          uldTare1: "120 kg",
          uldType2: "2 x LD-1 / AKC",
          uldDimensions2: "91.7\" x 60.2\" x 63.8\"",
          uldPayload2: "1,588 kg",
          uldType3: "1 x PMC/P6P - Q6 (A1 position)",
          uldDimensions3: "124.8\" x 96.1\" x 96.1\"",
          uldPayload3: "2,611 kg",
          uldType4: "1 x PMC/P6P - Q6 (A2 position)",
          uldDimensions4: "124.8\" x 96.1\" x 96.1\"",
          uldPayload4: "2,611 kg",
          uldType5: "5 x PMC/P6P - Q6",
          uldDimensions5: "124.8\" x 96.1\" x 96\"",
          uldPayload5: "4,250 kg",
          uldType6: "23 x PMC/P6P - Q7 (B747F & A380F)",
          uldDimensions6: "96.1\" x 124.8\" x 118.1\"",
          uldPayload6: "4,819 kg"
        }
      },
      {
        name: "757-200F",
        fullName: "757-200F (Main Deck)",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "32,000 kg",
          cargoVolume: "7,275 m³",
          totalULDs: "15 ULDs",
          uldType1: "15 x PAG/P1P - (727-200F, 757-200F)",
          uldDimensions1: "88.2\" x 124.8\" x 79.5\"",
          uldPayload1: "5,000 kg",
          uldTare1: "100 kg",
          topContours: "Front: 37.8\" x 36.2\", Rear: 37.8\" x 36.2\""
        }
      },
      {
        name: "767-200F",
        fullName: "767-200F",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "42,000 kg",
          cargoVolume: "13,580 m³",
          totalULDs: "32 ULDs (5 types)",
          uldType1: "3 x PAG/P1P - LD-7",
          uldDimensions1: "88.2\" x 124.8\" x 64.2\"",
          uldPayload1: "5,000 kg",
          uldTare1: "100 kg",
          uldType2: "10 x DPE/APE",
          uldDimensions2: "60.2\" x 61.8\" x 64.2\"",
          uldPayload2: "1,220 kg",
          uldTare2: "90 kg",
          uldType3: "16 x PAG/P1P - Q6 (Side by side 1-8 L/R)",
          uldDimensions3: "88.2\" x 124.8\" x 96.1\"",
          uldPayload3: "5,000 kg",
          uldType4: "2 x PAG/P1P - Q6 (Side by side 9L/R)",
          uldDimensions4: "88.2\" x 124.8\" x 91.7\"",
          uldPayload4: "5,000 kg",
          uldType5: "1 x PAG/P1P - Q6 (Single Row Last)",
          uldDimensions5: "124.8\" x 88.2\" x 80.7\"",
          uldPayload5: "5,000 kg"
        }
      },
      {
        name: "767-300F",
        fullName: "767-300F",
        type: "Freighter Aircraft",
        icon: Plane,
        specs: {
          defaultPayload: "51,000 kg",
          cargoVolume: "17,251 m³",
          totalULDs: "33 ULDs (5 types)",
          uldType1: "7 x PMC/P6P - LD",
          uldDimensions1: "124.8\" x 96.1\" x 64\"",
          uldPayload1: "5,000 kg",
          uldTare1: "120 kg",
          uldType2: "2 x DPE/APE",
          uldDimensions2: "60.2\" x 61.8\" x 64.2\"",
          uldPayload2: "1,220 kg",
          uldTare2: "90 kg",
          uldType3: "1 x PAG/P1P (B767-300F A1)",
          uldDimensions3: "124.8\" x 88.2\" x 76\"",
          uldPayload3: "2,268 kg",
          uldType4: "22 x PAG/P1P - Q6 (Side by side)",
          uldDimensions4: "88.2\" x 124.8\" x 96.1\"",
          uldPayload4: "3,429 kg",
          uldType5: "1 x PAG/P1P (B767-300F A13)",
          uldDimensions5: "124.8\" x 88.2\" x 78.7\"",
          uldPayload5: "2,722 kg"
        }
      },
      {
        name: "A300-600F",
        fullName: "A300-600F",
        type: "Airbus Freighter",
        icon: Plane,
        specs: {
          defaultPayload: "143,032 kg",
          cargoVolume: "15,428 m³",
          totalULDs: "30 ULDs (4 types)",
          uldType1: "7 x PMC/P6P - LD",
          uldDimensions1: "124.8\" x 96.1\" x 64\"",
          uldPayload1: "5,000 kg",
          uldTare1: "120 kg",
          uldType2: "18 x PMC/P6P - (A300 - SBS 1-9L/R)",
          uldDimensions2: "124.8\" x 88.2\" x 96\"",
          uldPayload2: "5,000 kg",
          uldTare2: "120 kg",
          uldType3: "3 x PAG/P1P - (A300 SBS 10-12)",
          uldDimensions3: "124.8\" x 88.2\" x 74.8\"",
          uldPayload3: "5,000 kg",
          uldTare3: "120 kg",
          uldType4: "2 x LD-3 / AKE",
          uldDimensions4: "75.6\" x 57.1\" x 63.8\"",
          uldPayload4: "1,516 kg"
        }
      },
      {
        name: "A300 B4-200F",
        fullName: "A300 B4-200F",
        type: "Airbus Freighter",
        icon: Plane,
        specs: {
          defaultPayload: "132,128 kg",
          cargoVolume: "14,564 m³",
          totalULDs: "32 ULDs (4 types)",
          uldType1: "4 x PMC/P6P - LD",
          uldDimensions1: "124.8\" x 96.1\" x 64\"",
          uldPayload1: "5,000 kg",
          uldTare1: "120 kg",
          uldType2: "8 x LD-3 / AKE",
          uldDimensions2: "75.6\" x 57.1\" x 63.8\"",
          uldPayload2: "1,516 kg",
          uldType3: "18 x PAG/P1P - (A300 - SBS 1-9L/R)",
          uldDimensions3: "124.8\" x 88.2\" x 96\"",
          uldPayload3: "5,000 kg",
          uldTare3: "120 kg",
          uldType4: "2 x PAG/P1P - (A300 SBS 10-12)",
          uldDimensions4: "124.8\" x 88.2\" x 74.8\"",
          uldPayload4: "5,000 kg",
          uldTare4: "120 kg"
        }
      }
    ],
    airPallets: [
      {
        name: "PMC/P6P - LD",
        fullName: "PMC/P6P - LD Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "64\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg"
        }
      },
      {
        name: "PMC/P6P - LD (Winged)",
        fullName: "PMC/P6P - LD (Winged) Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "164.2\"",
          width: "96.1\"",
          maxHeight: "64.2\"",
          floorHigh: "3.9\"",
          payload: "5,000 kg",
          tare: "120 kg",
          bottomContourLeft: "19.7\" x 19.7\"",
          bottomContourRight: "19.7\" x 19.7\""
        }
      },
      {
        name: "PMC/P6P - Q6",
        fullName: "PMC/P6P - Q6 Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "96\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg"
        }
      },
      {
        name: "PMC/P6P - Q7",
        fullName: "PMC/P6P - Q7 Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "118.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg"
        }
      },
      {
        name: "PAG/P1P - LD-7",
        fullName: "PAG/P1P - LD-7 Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "124.8\"",
          maxHeight: "64.2\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg"
        }
      },
      {
        name: "PAG/P1P - Q6",
        fullName: "PAG/P1P - Q6 Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "124.8\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg"
        }
      },
      {
        name: "PAG/P1P - Q7",
        fullName: "PAG/P1P - Q7 Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "118.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg"
        }
      },
      {
        name: "LD-11 / ALP",
        fullName: "LD-11 / ALP Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "119.7\"",
          width: "57.1\"",
          maxHeight: "61\"",
          payload: "3,176 kg"
        }
      },
      {
        name: "LD-1 / AKC",
        fullName: "LD-1 / AKC Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "91.7\"",
          width: "60.2\"",
          maxHeight: "63.8\"",
          payload: "1,588 kg",
          bottomContourRight: "30.3\" x 35.4\""
        }
      },
      {
        name: "LD-26 / AAF",
        fullName: "LD-26 / AAF Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "157.5\"",
          width: "84.3\"",
          maxHeight: "60.2\"",
          payload: "6,033 kg",
          tare: "250 kg",
          bottomContour: "18.5\" x 18.5\" (all corners)"
        }
      },
      {
        name: "LD-2 (APA/DAPA)",
        fullName: "LD-2 (APA/DAPA) Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "61.5\"",
          width: "60.4\"",
          maxHeight: "64\"",
          payload: "1,133 kg",
          tare: "90 kg",
          bottomContour: "14.5\" x 14.5\""
        }
      },
      {
        name: "LD3-45 / AKH",
        fullName: "LD3-45 / AKH Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "94.9\"",
          width: "55.5\"",
          maxHeight: "42.9\"",
          payload: "1,058 kg",
          bottomContour: "18.9\" x 18.9\" (all corners)"
        }
      },
      {
        name: "LD-3 / AKE",
        fullName: "LD-3 / AKE Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "75.6\"",
          width: "57.1\"",
          maxHeight: "63.8\"",
          payload: "1,516 kg",
          bottomContourLeft: "17.7\" x 20.1\"",
          bottomContourRight: "17.7\" x 20.1\""
        }
      },
      {
        name: "LD-8 / (ALN/DQN/DGF)",
        fullName: "LD-8 / (ALN/DQN/DGF) Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124\"",
          width: "60.2\"",
          maxHeight: "64.2\"",
          payload: "2,282 kg",
          bottomContourLeft: "14\" x 20.1\"",
          bottomContourRight: "14\" x 20.1\""
        }
      },
      {
        name: "LD-9 / AAP",
        fullName: "LD-9 / AAP Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "119.7\"",
          width: "83.9\"",
          maxHeight: "59.8\"",
          payload: "4,426 kg"
        }
      },
      {
        name: "PGA 20ft",
        fullName: "PGA 20ft Pallet",
        type: "Air Pallet",
        icon: Package,
        specs: {
          length: "238.5\"",
          width: "96\"",
          maxHeight: "96.1\"",
          floorHigh: "0.4\"",
          payload: "11,760 kg",
          tare: "410 kg"
        }
      },
      {
        name: "PLA Half Pallet",
        fullName: "PLA Half Pallet",
        type: "Air Pallet",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "60.2\"",
          maxHeight: "96.1\"",
          floorHigh: "0.4\"",
          payload: "1,588 kg",
          tare: "80 kg"
        }
      },
      {
        name: "PLA Half Pallet (LD)",
        fullName: "PLA Half Pallet (LD)",
        type: "Air Pallet",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "60.2\"",
          maxHeight: "64.2\"",
          floorHigh: "0.4\"",
          payload: "1,588 kg",
          tare: "80 kg"
        }
      },
      {
        name: "PRA/MDP - 16ft Pallet",
        fullName: "PRA/MDP - 16ft Pallet",
        type: "Air Pallet",
        icon: Package,
        specs: {
          length: "195.7\"",
          width: "96.1\"",
          maxHeight: "96.1\"",
          payload: "7,000 kg",
          tare: "410 kg"
        }
      },
      {
        name: "PYB - Q6",
        fullName: "PYB - Q6 Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "54.7\"",
          maxHeight: "96.1\"",
          floorHigh: "0.4\"",
          payload: "2,120 kg",
          tare: "60 kg"
        }
      },
      {
        name: "PMC/P6P - Q6 (747-300/400F A1)",
        fullName: "PMC/P6P - Q6 (747-300/400F A1 position)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourLeft: "48\" x 35\"",
          topContourRight: "48\" x 35\""
        }
      },
      {
        name: "PMC/P6P - Q6 (747-300/400F A2)",
        fullName: "PMC/P6P - Q6 (747-300/400F A2 position)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourLeft: "15.4\" x 29.1\"",
          topContourRight: "15.4\" x 29.1\""
        }
      },
      {
        name: "PMC/P6P - Q7 (B747F & A380F)",
        fullName: "PMC/P6P - Q7 (B747F & A380F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "124.8\"",
          maxHeight: "118.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourRight: "24\" x 22\""
        }
      },
      {
        name: "PYB - Q7 (747F)",
        fullName: "PYB - Q7 (747F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "54.7\"",
          maxHeight: "118.1\"",
          floorHigh: "0.4\"",
          payload: "2,120 kg",
          tare: "60 kg",
          topContourRight: "24\" x 22\""
        }
      },
      {
        name: "PAG/P1P - Q6 (B767-200F SIDE BY SIDE)",
        fullName: "PAG/P1P - Q6 (B767-200F Side by Side 1-8 L/R)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "124.8\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg",
          topContourRight: "43.3\" x 53.5\""
        }
      },
      {
        name: "PAG/P1P - Q6 (B767-200F Side 9L/R)",
        fullName: "PAG/P1P - Q6 (B767-200F Side by side 9L/R)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "124.8\"",
          maxHeight: "91.7\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg",
          topContourRight: "43.3\" x 53.5\""
        }
      },
      {
        name: "PAG/P1P - Q6 (B767-200F Single Row)",
        fullName: "PAG/P1P - Q6 (B767-200F Single Row 1-11)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "88.2\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg",
          topContourLeft: "17.3\" x 14.2\"",
          topContourRight: "17.3\" x 14.2\""
        }
      },
      {
        name: "PAG/P1P - Q6 (B767-200F Single Row 12)",
        fullName: "PAG/P1P - Q6 (B767-200F Single Row 12)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "88.2\"",
          maxHeight: "80.7\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg",
          topContourLeft: "26\" x 36.2\"",
          topContourRight: "26\" x 36.2\""
        }
      },
      {
        name: "PMC/P6P - Q6 (B767-200F Single Row)",
        fullName: "PMC/P6P - Q6 (B767-200F Single Row)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourLeft: "17.3\" x 14.2\"",
          topContourRight: "17.3\" x 14.2\""
        }
      },
      {
        name: "PAG/P1P (B767-300F A1)",
        fullName: "PAG/P1P (B767-300F A1)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "88.2\"",
          maxHeight: "76\"",
          floorHigh: "0.8\"",
          payload: "2,286 kg",
          tare: "100 kg",
          topContourLeft: "28\" x 29.1\"",
          topContourRight: "28\" x 29.1\""
        }
      },
      {
        name: "PAG/P1P (B767-300F A13)",
        fullName: "PAG/P1P (B767-300F A13)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "88.2\"",
          maxHeight: "78.7\"",
          floorHigh: "0.8\"",
          payload: "2,722 kg",
          tare: "100 kg",
          topContourLeft: "28\" x 35.8\"",
          topContourRight: "28\" x 35.8\""
        }
      },
      {
        name: "PAG/P1P - Q6 (B767-300F Side by side)",
        fullName: "PAG/P1P - Q6 (B767-300F Side by side)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "124.8\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "3,429 kg",
          tare: "100 kg",
          topContourRight: "41.3\" x 53.5\""
        }
      },
      {
        name: "PAG/P1P - Q6 (B767-300F Single Row)",
        fullName: "PAG/P1P - Q6 (B767-300F Single Row)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "88.2\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg",
          topContourLeft: "14.2\" x 12.2\"",
          topContourRight: "14.2\" x 12.2\""
        }
      },
      {
        name: "PRA/MDP - 16ft Pallet (B767-300F)",
        fullName: "PRA/MDP - 16ft Pallet (B767-300F)",
        type: "Air Pallet",
        icon: Package,
        specs: {
          length: "195.7\"",
          width: "96.1\"",
          maxHeight: "96.1\"",
          payload: "6,804 kg",
          tare: "410 kg",
          topContourLeft: "35.4\" x 26.8\"",
          topContourRight: "35.4\" x 26.8\"",
          topContourFront: "16.1\" x 52.4\"",
          topContourRear: "16.1\" x 52.6\""
        }
      },
      {
        name: "PAG/P1P - Q4 (B777F)",
        fullName: "PAG/P1P - Q4 (B777F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "125\"",
          maxHeight: "115.7\"",
          payload: "4,500 kg",
          tare: "100 kg",
          topContourRight: "46.9\" x 56.7\""
        }
      },
      {
        name: "PMC/P6P - Q6 (B777F)",
        fullName: "PMC/P6P - Q6 (B777F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "124.8\"",
          maxHeight: "115.7\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourRight: "56.7\" x 62.6\""
        }
      },
      {
        name: "PMC/P6P - Q7 (B777F)",
        fullName: "PMC/P6P - Q7 (B777F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "124.8\"",
          maxHeight: "118.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourRight: "50\" x 40.9\""
        }
      },
      {
        name: "PMC/P6P - Q4 (B777F)",
        fullName: "PMC/P6P - Q4 (B777F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "124.8\"",
          maxHeight: "115.7\"",
          payload: "4,500 kg",
          tare: "120 kg",
          topContourRight: "57.1\" x 63.8\""
        }
      },
      {
        name: "PMC/P6P - Q5 (B777F)",
        fullName: "PMC/P6P - Q5 (B777F)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "124.8\"",
          maxHeight: "118.1\"",
          payload: "4,500 kg",
          tare: "120 kg",
          topContourRight: "50\" x 42.1\""
        }
      },
      {
        name: "PMC/P6P - Q6 (A330-200F 90\" Single)",
        fullName: "PMC/P6P - Q6 (A330-200F 90\" Single Row)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "89.8\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourLeft: "33.9\" x 29.9\"",
          topContourRight: "33.9\" x 29.9\""
        }
      },
      {
        name: "PMC/P6P - Q6 (A330-200F 96\" Single)",
        fullName: "PMC/P6P - Q6 (A330-200F 96\" Single Row)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "96.1\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourLeft: "20.1\" x 12.2\"",
          topContourRight: "20.1\" x 12.2\""
        }
      },
      {
        name: "PMC/P6P - Q6 (A330 Side by side)",
        fullName: "PMC/P6P - Q6 (A330 Side by side)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "96.1\"",
          width: "124.8\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "120 kg",
          topContourRight: "55.9\" x 60.2\""
        }
      },
      {
        name: "PAG/P1P - Q6 (A330 Side by side)",
        fullName: "PAG/P1P - Q6 (A330 Side by side)",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "88.2\"",
          width: "124.8\"",
          maxHeight: "96.1\"",
          floorHigh: "0.8\"",
          payload: "5,000 kg",
          tare: "100 kg",
          topContourRight: "48\" x 35.8\""
        }
      },
      {
        name: "AAN",
        fullName: "AAN Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "117.3\"",
          width: "81.9\"",
          maxHeight: "58.3\"",
          payload: "1,588 kg",
          tare: "230 kg",
          bottomContour: "14\" x 14\" (all corners)"
        }
      },
      {
        name: "CMP",
        fullName: "CMP Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "87\"",
          width: "59.8\"",
          maxHeight: "80.3\"",
          payload: "4,000 kg"
        }
      },
      {
        name: "A2N",
        fullName: "A2N Container",
        type: "Air Container",
        icon: Package,
        specs: {
          length: "124.8\"",
          width: "87.8\"",
          maxHeight: "80.7\"",
          payload: "6,033 kg",
          topContourLeft: "42.3\" x 35.8\"",
          topContourRight: "42.3\" x 35.8\""
        }
      }
    ],
    seaVessels: [
      {
        name: "BBC-12K-300A",
        fullName: "BBC-12K-300A",
        type: "Multipurpose Vessel",
        icon: Ship,
        specs: {
          defaultPayload: "12,780,000 kg",
          cargoVolume: "1,052,675 m³",
          totalContainers: "4 containers",
          hold1: "Hold 1",
          hold1Dimensions: "740.2\" x 590.6\" x 413.4\"",
          hold2: "Hold 2", 
          hold2Dimensions: "1,653.5\" x 590.6\" x 440.9\"",
          hold3: "Hold 3",
          hold3Dimensions: "1,003.9\" x 689\" x 425.2\"",
          maindeck: "Maindeck",
          maindeckDimensions: "3,437\" x 689\" x 385.8\""
        }
      },
      {
        name: "BBC-31K-500A",
        fullName: "BBC-31K-500A", 
        type: "Multipurpose Vessel",
        icon: Ship,
        specs: {
          defaultPayload: "31,600,000 kg",
          cargoVolume: "2,620,368 m³",
          totalContainers: "3 containers",
          hold1: "Hold 1",
          hold1Dimensions: "1,212.6\" x 905.5\" x 614.2\"",
          hold2: "Hold 2",
          hold2Dimensions: "3,173.2\" x 905.5\" x 614.2\"",
          maindeck: "Maindeck",
          maindeckDimensions: "4,405.5\" x 905.5\" x 523.6\""
        }
      },
      {
        name: "BBC-7K-500A",
        fullName: "BBC-7K-500A",
        type: "Multipurpose Vessel", 
        icon: Ship,
        specs: {
          defaultPayload: "7,500,000 kg",
          cargoVolume: "841,281 m³", 
          totalContainers: "3 containers",
          hold1: "Hold 1",
          hold1Dimensions: "744.1\" x 389.8\" x 425.2\"",
          hold2: "Hold 2",
          hold2Dimensions: "2,047.2\" x 633.9\" x 425.2\"",
          maindeck: "Maindeck",
          maindeckDimensions: "2,811\" x 633.9\" x 437\""
        }
      },
      {
        name: "BBC-9K-700A",
        fullName: "BBC-9K-700A",
        type: "Multipurpose Vessel",
        icon: Ship,
        specs: {
          defaultPayload: "9,282,000 kg",
          cargoVolume: "1,119,856 m³",
          totalContainers: "3 containers", 
          hold1: "Hold 1",
          hold1Dimensions: "744.1\" x 448.8\" x 425.2\"",
          hold2: "Hold 2", 
          hold2Dimensions: "2,252\" x 669.3\" x 425.2\"",
          maindeck: "Maindeck",
          maindeckDimensions: "3,015.7\" x 669.3\" x 570.9\""
        }
      }
    ],
    seaContainers: [
      {
        name: "20ft DV",
        fullName: "20ft Dry Van Container",
        type: "Sea Container",
        icon: Container,
        specs: {
          length: "233 in",
          width: "92 in",
          height: "94 in",
          payload: "20,000 kg",
          tare: "2,300 kg",
          doorHeight: "90.2 in",
          doorWidth: "92.1 in"
        }
      },
      {
        name: "40ft DV",
        fullName: "40ft Dry Van Container",
        type: "Sea Container",
        icon: Container,
        specs: {
          length: "472 in",
          width: "92 in",
          height: "94 in",
          payload: "22,000 kg",
          tare: "3,750 kg",
          doorHeight: "90.2 in",
          doorWidth: "92.1 in"
        }
      },
      {
        name: "40ft HC",
        fullName: "40ft High Cube Container",
        type: "Sea Container",
        icon: Container,
        specs: {
          length: "473 in",
          width: "93 in",
          height: "106 in",
          payload: "25,000 kg",
          tare: "3,940 kg",
          doorHeight: "102 in",
          doorWidth: "92.1 in"
        }
      },
      {
        name: "45ft HQ",
        fullName: "45ft High Cube Container",
        type: "Sea Container",
        icon: Container,
        specs: {
          length: "534 in",
          width: "92 in",
          height: "106 in",
          payload: "26,000 kg",
          tare: "4,820 kg",
          doorHeight: "102 in",
          doorWidth: "92.1 in"
        }
      }
    ]
  };

  const getFilteredEquipment = (): Equipment[] => {
    let filteredEquipment: Equipment[] = [];
    
    if (currentCategory === 'all') {
      filteredEquipment = [
        ...equipmentData.aircraft,
        ...equipmentData.airPallets,
        ...equipmentData.seaVessels,
        ...equipmentData.seaContainers
      ];
    } else {
      const categoryMap: { [key: string]: keyof EquipmentData } = {
        'aircraft': 'aircraft',
        'air-pallets': 'airPallets',
        'sea-vessels': 'seaVessels',
        'sea-containers': 'seaContainers'
      };
      filteredEquipment = equipmentData[categoryMap[currentCategory]] || [];
    }
    
    if (searchTerm) {
      filteredEquipment = filteredEquipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredEquipment;
  };

  const formatLabel = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const showDetails = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsDetailPanelOpen(true);
  };

  const hideDetails = () => {
    setIsDetailPanelOpen(false);
    setSelectedEquipment(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideDetails();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredEquipment = getFilteredEquipment();

  return (
    <>
      <Head>
        <title>Cargo Equipment Catalog - Cargo Calculators</title>
        <meta name="description" content="Comprehensive catalog of cargo equipment including aircraft, containers, pallets, and vessels" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                🚢 Cargo Equipment Catalog
              </h1>
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border-2 border-blue-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { key: 'all', label: 'All Equipment' },
              { key: 'aircraft', label: 'Aircraft' },
              { key: 'air-pallets', label: 'Air Pallets & Containers' },
              { key: 'sea-vessels', label: 'Sea Vessels' },
              { key: 'sea-containers', label: 'Sea Containers' }
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`px-6 py-3 rounded-2xl font-semibold text-sm uppercase tracking-wider transition-all ${
                  currentCategory === key
                    ? 'bg-white/90 text-blue-900 border-2 border-white/80'
                    : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20'
                }`}
                onClick={() => setCurrentCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <h3 className="text-2xl text-white/80 mb-4">No equipment found</h3>
                <p className="text-white/60">Try adjusting your search or category filter.</p>
              </div>
            ) : (
              filteredEquipment.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
                  onClick={() => showDetails(item)}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-white bg-gradient-to-br from-blue-900 to-blue-700 p-3 rounded-2xl mr-3">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 uppercase tracking-wide">{item.type}</p>
                    </div>
                  </div>
                  
                  {item.specs && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(item.specs).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-gray-600">
                          <span className="font-semibold text-blue-900">{formatLabel(key)}:</span> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {isDetailPanelOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-[998]"
              onClick={hideDetails}
            />
            
            {/* Panel */}
            <div className="fixed top-0 right-0 w-full max-w-2xl h-full bg-white/98 backdrop-blur-xl shadow-2xl z-[999] overflow-y-auto">
              {selectedEquipment && (
                <>
                  {/* Panel Header */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 sticky top-0 z-10">
                    <button
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      onClick={hideDetails}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold mb-2">{selectedEquipment.fullName}</h2>
                    <p className="text-blue-100">{selectedEquipment.type}</p>
                  </div>

                  {/* Panel Content */}
                  <div className="p-8">
                    {selectedEquipment.specs ? (
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                              <th className="px-6 py-4 text-left font-semibold">Specification</th>
                              <th className="px-6 py-4 text-left font-semibold">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(selectedEquipment.specs).map(([key, value], index) => (
                              <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-6 py-4 font-medium text-gray-700">
                                  {formatLabel(key)}
                                </td>
                                <td className="px-6 py-4 font-bold text-blue-900">
                                  {value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Detailed specifications will be available soon.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CargoEquipmentCatalog;