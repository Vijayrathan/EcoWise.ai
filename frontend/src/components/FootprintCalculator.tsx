import React, { useState } from 'react';
import './FootprintCalculator.css';

interface CalculatorForm {
  transportation: {
    carKm: number;
    busKm: number;
    trainKm: number;
    planeKm: number;
  };
  home: {
    electricityKwh: number;
    gasKwh: number;
    oilLiters: number;
  };
  food: {
    meatMeals: number;
    vegetarianMeals: number;
    veganMeals: number;
  };
}

const FootprintCalculator: React.FC = () => {
  const [formData, setFormData] = useState<CalculatorForm>({
    transportation: {
      carKm: 0,
      busKm: 0,
      trainKm: 0,
      planeKm: 0,
    },
    home: {
      electricityKwh: 0,
      gasKwh: 0,
      oilLiters: 0,
    },
    food: {
      meatMeals: 0,
      vegetarianMeals: 0,
      veganMeals: 0,
    },
  });

  const [showResults, setShowResults] = useState(false);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comparisonStats, setComparisonStats] = useState({
    trees: 0,
    flights: 0,
    driving: 0,
  });

  const emissionsFactors = {
    transportation: {
      car: 2.3, // kg CO2 per km
      bus: 0.1, // kg CO2 per km
      train: 0.04, // kg CO2 per km
      plane: 0.25, // kg CO2 per km
    },
    home: {
      electricity: 0.5, // kg CO2 per kWh
      gas: 0.2, // kg CO2 per kWh
      oil: 0.25, // kg CO2 per liter
    },
    food: {
      meat: 6.0, // kg CO2 per meal
      vegetarian: 1.5, // kg CO2 per meal
      vegan: 1.0, // kg CO2 per meal
    },
  };

  const updateField = (
    section: keyof CalculatorForm,
    field: string,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const calculateFootprint = () => {
    setLoading(true);

    setTimeout(() => {
      // Calculate transportation emissions
      const transportEmissions =
        formData.transportation.carKm * emissionsFactors.transportation.car +
        formData.transportation.busKm * emissionsFactors.transportation.bus +
        formData.transportation.trainKm * emissionsFactors.transportation.train +
        formData.transportation.planeKm * emissionsFactors.transportation.plane;

      // Calculate home energy emissions
      const homeEmissions =
        formData.home.electricityKwh * emissionsFactors.home.electricity +
        formData.home.gasKwh * emissionsFactors.home.gas +
        formData.home.oilLiters * emissionsFactors.home.oil;

      // Calculate food emissions
      const foodEmissions =
        formData.food.meatMeals * emissionsFactors.food.meat +
        formData.food.vegetarianMeals * emissionsFactors.food.vegetarian +
        formData.food.veganMeals * emissionsFactors.food.vegan;

      // Calculate total carbon footprint
      const total = transportEmissions + homeEmissions + foodEmissions;
      setCarbonFootprint(total);

      // Calculate comparison stats
      setComparisonStats({
        trees: Math.round(total / 21), // 1 tree absorbs ~21kg CO2 per year
        flights: Math.round(total / 500), // 1 flight emits ~500kg CO2
        driving: Math.round(total / 2.3 / 100), // Driving 100km emits ~230kg CO2
      });

      setShowResults(true);
      setLoading(false);
    }, 1500);
  };

  const resetCalculator = () => {
    setFormData({
      transportation: {
        carKm: 0,
        busKm: 0,
        trainKm: 0,
        planeKm: 0,
      },
      home: {
        electricityKwh: 0,
        gasKwh: 0,
        oilLiters: 0,
      },
      food: {
        meatMeals: 0,
        vegetarianMeals: 0,
        veganMeals: 0,
      },
    });
    setShowResults(false);
  };

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>
          <i className="fas fa-calculator"></i> Carbon Footprint Calculator
        </h1>
        <p>Measure your environmental impact and find ways to reduce it</p>
      </div>

      <div className="calculator-card">
        <form onSubmit={(e) => { e.preventDefault(); calculateFootprint(); }}>
          {/* Transportation Section */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <i className="fas fa-car"></i> Transportation
              </h2>
              <p>Track your weekly travel habits</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carKm">Car Travel (km/week)</label>
                <input
                  type="number"
                  id="carKm"
                  value={formData.transportation.carKm}
                  onChange={(e) => updateField('transportation', 'carKm', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="busKm">Bus Travel (km/week)</label>
                <input
                  type="number"
                  id="busKm"
                  value={formData.transportation.busKm}
                  onChange={(e) => updateField('transportation', 'busKm', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trainKm">Train Travel (km/week)</label>
                <input
                  type="number"
                  id="trainKm"
                  value={formData.transportation.trainKm}
                  onChange={(e) => updateField('transportation', 'trainKm', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="planeKm">Air Travel (km/month)</label>
                <input
                  type="number"
                  id="planeKm"
                  value={formData.transportation.planeKm}
                  onChange={(e) => updateField('transportation', 'planeKm', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Home Energy Section */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <i className="fas fa-home"></i> Home Energy
              </h2>
              <p>Track your monthly energy consumption</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="electricityKwh">Electricity (kWh/month)</label>
                <input
                  type="number"
                  id="electricityKwh"
                  value={formData.home.electricityKwh}
                  onChange={(e) => updateField('home', 'electricityKwh', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gasKwh">Natural Gas (kWh/month)</label>
                <input
                  type="number"
                  id="gasKwh"
                  value={formData.home.gasKwh}
                  onChange={(e) => updateField('home', 'gasKwh', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="oilLiters">Oil (liters/month)</label>
                <input
                  type="number"
                  id="oilLiters"
                  value={formData.home.oilLiters}
                  onChange={(e) => updateField('home', 'oilLiters', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Food Section */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <i className="fas fa-utensils"></i> Food
              </h2>
              <p>Track your weekly diet</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="meatMeals">Meat Meals (per week)</label>
                <input
                  type="number"
                  id="meatMeals"
                  value={formData.food.meatMeals}
                  onChange={(e) => updateField('food', 'meatMeals', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="vegetarianMeals">Vegetarian Meals (per week)</label>
                <input
                  type="number"
                  id="vegetarianMeals"
                  value={formData.food.vegetarianMeals}
                  onChange={(e) => updateField('food', 'vegetarianMeals', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="veganMeals">Vegan Meals (per week)</label>
                <input
                  type="number"
                  id="veganMeals"
                  value={formData.food.veganMeals}
                  onChange={(e) => updateField('food', 'veganMeals', parseFloat(e.target.value) || 0)}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="calculator-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={resetCalculator}>
              Reset
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              Calculate Footprint
            </button>
          </div>
        </form>

        {/* Results Section */}
        {showResults && (
          <div className="results-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-chart-pie"></i> Your Carbon Footprint
              </h2>
            </div>

            <div className="result-card">
              <div className="carbon-result">
                <div className="result-value">{carbonFootprint.toFixed(1)}</div>
                <div className="result-unit">kg CO₂e</div>
              </div>

              <div className="result-comparisons">
                <div className="comparison-item">
                  <i className="fas fa-tree"></i>
                  <div className="comparison-text">
                    <span className="comparison-value">{comparisonStats.trees}</span>
                    trees needed to absorb this CO₂ in one year
                  </div>
                </div>

                <div className="comparison-item">
                  <i className="fas fa-plane"></i>
                  <div className="comparison-text">
                    <span className="comparison-value">{comparisonStats.flights}</span>
                    flight(s) from London to New York
                  </div>
                </div>

                <div className="comparison-item">
                  <i className="fas fa-car"></i>
                  <div className="comparison-text">
                    <span className="comparison-value">{comparisonStats.driving}</span>
                    days of average car use
                  </div>
                </div>
              </div>

              <div className="reduction-tips">
                <h3>Tips to Reduce Your Carbon Footprint:</h3>
                <ul>
                  <li>Consider using public transportation more frequently</li>
                  <li>Reduce meat consumption by incorporating more plant-based meals</li>
                  <li>Turn off electronics and appliances when not in use</li>
                  <li>Add home insulation to reduce heating/cooling needs</li>
                  <li>Switch to renewable energy sources if available in your area</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FootprintCalculator;

