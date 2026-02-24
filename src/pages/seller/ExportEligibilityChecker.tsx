import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Globe, Shield, FileText, BarChart, ChevronRight, CheckCircle2, AlertTriangle, Info, Download, ArrowLeft, Sparkles, Save, Loader2 } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { authService } from '../../services/auth';

interface HSCodeOption {
 code: string;
 description: string;
 confidence: number;
}

interface EligibilityResult {
 agreementName: string;
 status: 'Eligible' | 'Conditional' | 'Not Eligible';
 dutyRate: string;
 landedCost: string;
 requirements: string[];
 explanation: string;
}

const MOCK_HS_CODES: HSCodeOption[] = [
 { code: '6109.10.00', description: 'T-shirts, singlets and other vests, knitted or crocheted, of cotton', confidence: 0.98 },
 { code: '6105.10.00', description: "Men's or boys' shirts, knitted or crocheted, of cotton", confidence: 0.85 },
 { code: '6205.20.00', description: "Men's or boys' shirts, of cotton (not knitted)", confidence: 0.72 },
];

const MOCK_AGREEMENTS: Record<string, any> = {
 'India-Sri Lanka (ISFTA)': {
  eligible: true,
  duty: '0%',
  requirements: ['Certificate of Origin (ISFTA Form)', 'Direct Consignment Rule', 'Minimum 35% Value Addition'],
  explanation: 'The product qualifies under the ISFTA as it meets the local value addition criteria for textile products.'
 },
 'SAFTA': {
  eligible: true,
  duty: '0-5%',
  requirements: ['SAFTA Certificate of Origin', 'Rules of Origin compliance', 'Valid Export License'],
  explanation: 'SAFTA provides preferential access to South Asian markets with reduced tariffs for most textile categories.'
 },
 'EU GSP': {
  eligible: true,
  duty: 'Reduced (approx 6.5%)',
  requirements: ['REX System Registration', 'GSP Certificate of Origin', 'Standard Compliance (REACH)', 'Labeling Requirements'],
  explanation: 'Standard GSP benefits apply, offering a significant reduction from the MFN rate for European imports.'
 }
};

export const ExportEligibilityChecker: React.FC = () => {
 const [step, setStep] = useState(1);
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
  productName: '',
  description: '',
  category: '',
  hsCode: '',
  exportCountry: 'India',
  importCountry: '',
  shipmentValue: '',
  quantity: ''
 });

 const [suggestedHS, setSuggestedHS] = useState<HSCodeOption[]>([]);
 const [selectedHS, setSelectedHS] = useState<HSCodeOption | null>(null);
 const [results, setResults] = useState<EligibilityResult[]>([]);
 const [readinessScore, setReadinessScore] = useState(0);
 const user = authService.getCurrentUser();
 const [isSaving, setIsSaving] = useState(false);
 const [activeTab, setActiveTab] = useState<'checker' | 'history'>('checker');
 const [history, setHistory] = useState<any[]>([]);
 const [loadingHistory, setLoadingHistory] = useState(false);

 const fetchHistory = async () => {
  if (!user) return;
  setLoadingHistory(true);
  try {
   const q = query(
    collection(db, 'trade_checks'),
    where('userId', '==', user.id),
    orderBy('timestamp', 'desc')
   );
   const snapshot = await getDocs(q);
   const historyData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
   }));
   setHistory(historyData);
  } catch (error) {
   console.error("Error fetching history:", error);
  } finally {
   setLoadingHistory(false);
  }
 };

 React.useEffect(() => {
  if (activeTab === 'history') {
   fetchHistory();
  }
 }, [activeTab]);

 const saveCheckToFirebase = async (checkResults: EligibilityResult[], score: number) => {
  if (!user) return;
  setIsSaving(true);
  try {
   await addDoc(collection(db, 'trade_checks'), {
    userId: user.id,
    userName: user.name,
    companyName: user.companyName,
    productName: formData.productName,
    description: formData.description,
    hsCode: selectedHS?.code,
    hsDescription: selectedHS?.description,
    exportCountry: formData.exportCountry,
    importCountry: formData.importCountry,
    shipmentValue: formData.shipmentValue,
    quantity: formData.quantity,
    results: checkResults,
    readinessScore: score,
    timestamp: Timestamp.now()
   });
   // Success - maybe show a small toast or just log
   console.log("Trade check saved to Firebase");
  } catch (error) {
   console.error("Error saving trade check:", error);
  } finally {
   setIsSaving(false);
  }
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
 };

 const runHSClassification = () => {
  if (!formData.description && !formData.productName) {
   alert('Please provide product name or description for AI classification.');
   return;
  }
  setLoading(true);
  // Simulate AI classification delay
  setTimeout(() => {
   setSuggestedHS(MOCK_HS_CODES);
   setLoading(false);
   setStep(2);
  }, 1500);
 };

 const runEligibilityCheck = () => {
  setLoading(true);
  // Simulate complex rule engine
  setTimeout(async () => {
   const countryAgreements = Object.entries(MOCK_AGREEMENTS).map(([name, data]) => ({
    agreementName: name,
    status: data.eligible ? 'Eligible' : 'Conditional' as any,
    dutyRate: data.duty,
    landedCost: `₹${(Number(formData.shipmentValue) * 1.05).toFixed(0)}`, // Mock calculation
    requirements: data.requirements,
    explanation: data.explanation
   }));

   const score = 85; // Mock score
   setResults(countryAgreements);
   setReadinessScore(score);
   setLoading(false);
   setStep(3);

   // Auto-save the results to Firebase
   await saveCheckToFirebase(countryAgreements, score);
  }, 2000);
 };

 const reset = () => {
  setStep(1);
  setFormData({
   productName: '',
   description: '',
   category: '',
   hsCode: '',
   exportCountry: 'India',
   importCountry: '',
   shipmentValue: '',
   quantity: ''
  });
  setSuggestedHS([]);
  setSelectedHS(null);
  setResults([]);
 };

 return (
  <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
   {/* Header */}
   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
    <div>
     <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--neutral-gray-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Sparkles className="text-primary-teal" /> AI Trade Intelligence
     </h1>
     <p style={{ color: 'var(--neutral-gray-500)', fontSize: '1.1rem' }}>Global Export Eligibility & Compliance Analyzer</p>
    </div>
    <div style={{ display: 'flex', gap: '1rem' }}>
     {step > 1 && activeTab === 'checker' && (
      <Button variant="outline" onClick={reset} leftIcon={<ArrowLeft size={18} />}>Start New Check</Button>
     )}
     <div style={{ display: 'flex', background: 'var(--neutral-gray-100)', padding: '0.25rem', borderRadius: '0.5rem' }}>
      <button
       onClick={() => setActiveTab('checker')}
       style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        background: activeTab === 'checker' ? 'white' : 'transparent',
        boxShadow: activeTab === 'checker' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
       }}
      >
       New Analysis
      </button>
      <button
       onClick={() => setActiveTab('history')}
       style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        background: activeTab === 'history' ? 'white' : 'transparent',
        boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
       }}
      >
       Saved Reports
      </button>
     </div>
    </div>
   </div>

   {activeTab === 'checker' ? (
    <>
     {/* Stepper */}
     <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
      <StepIndicator current={step} step={1} label="Product Details" />
      <StepIndicator current={step} step={2} label="HS Classification" />
      <StepIndicator current={step} step={3} label="Eligibility Report" />
     </div>

     {/* Step 1: Input Form */}
     {step === 1 && (
      <Card style={{ padding: '2.5rem' }}>
       <div className="form-grid" style={{ marginBottom: '2rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
         <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product Name</label>
         <input
          name="productName"
          value={formData.productName}
          onChange={handleInputChange}
          className="w-full input-focus"
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--neutral-gray-300)', fontSize: '1rem' }}
          placeholder="e.g. Organic Cotton Polo Shirts"
         />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
         <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Detailed Product Description (for AI Classification)</label>
         <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full input-focus"
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--neutral-gray-300)', fontSize: '1rem', minHeight: '100px', fontFamily: 'inherit' }}
          placeholder="Describe materials, manufacturing process, and intended use..."
         />
        </div>
        <div>
         <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Export Country</label>
         <select
          name="exportCountry"
          value={formData.exportCountry}
          onChange={handleInputChange}
          className="w-full input-focus"
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--neutral-gray-300)', backgroundColor: 'white', fontSize: '1rem' }}
         >
          <option value="India">India</option>
          <option value="Vietnam">Vietnam</option>
          <option value="Bangladesh">Bangladesh</option>
         </select>
        </div>
        <div>
         <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Target Market (Import Country)</label>
         <select
          name="importCountry"
          value={formData.importCountry}
          onChange={handleInputChange}
          className="w-full input-focus"
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--neutral-gray-300)', background: 'white', fontSize: '1rem' }}
         >
          <option value="">Select Target Country</option>
          <option value="USA">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="Germany">Germany</option>
          <option value="Sri Lanka">Sri Lanka</option>
          <option value="UAE">UAE</option>
          <option value="Singapore">Singapore</option>
         </select>
        </div>
        <div>
         <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Shipment Value (INR)</label>
         <input
          name="shipmentValue"
          type="number"
          value={formData.shipmentValue}
          onChange={handleInputChange}
          className="w-full input-focus"
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--neutral-gray-300)', fontSize: '1rem' }}
          placeholder="0.00"
         />
        </div>
        <div>
         <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
         <input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleInputChange}
          className="w-full input-focus"
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--neutral-gray-300)', fontSize: '1rem' }}
          placeholder="1000"
         />
        </div>
       </div>

       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
         size="lg"
         onClick={runHSClassification}
         isLoading={loading}
         disabled={!formData.productName || !formData.importCountry}
         rightIcon={<ChevronRight size={18} />}
        >
         Analyze HS Code
        </Button>
       </div>
      </Card>
     )}

     {/* Step 2: HS Classification Suggestions */}
     {step === 2 && (
      <div className="animate-fade-in">
       <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--primary-teal)' }}>
         <div style={{ padding: '0.75rem', background: 'var(--primary-teal-light)', borderRadius: '50%' }}>
          <Globe size={24} />
         </div>
         <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>AI-Suggested HS Codes</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-500)', margin: 0 }}>Based on your product description</p>
         </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         {suggestedHS.map((option) => (
          <div
           key={option.code}
           onClick={() => setSelectedHS(option)}
           style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: `2px solid ${selectedHS?.code === option.code ? 'var(--primary-teal)' : 'var(--neutral-gray-200)'}`,
            background: selectedHS?.code === option.code ? 'var(--primary-teal-light)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
           }}
          >
           <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
             <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--neutral-gray-900)' }}>{option.code}</span>
             <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              background: option.confidence > 0.9 ? '#dcfce7' : '#fef9c3',
              color: option.confidence > 0.9 ? '#166534' : '#854d0e',
              borderRadius: '99px',
              fontWeight: 600
             }}>
              {(option.confidence * 100).toFixed(0)}% Confidence
             </span>
            </div>
            <p style={{ margin: 0, color: 'var(--neutral-gray-600)', fontSize: '0.875rem' }}>{option.description}</p>
           </div>
           {selectedHS?.code === option.code && <CheckCircle2 size={24} className="text-primary-teal" />}
          </div>
         ))}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <Button variant="ghost" onClick={() => setStep(1)}>Modify Product Details</Button>
         <Button
          size="lg"
          onClick={runEligibilityCheck}
          isLoading={loading}
          disabled={!selectedHS}
          rightIcon={<Shield size={18} />}
         >
          Check Trade Eligibility
         </Button>
        </div>
       </Card>

       <Card style={{ padding: '1.5rem', background: '#f8fafc', border: '1px dashed var(--neutral-gray-300)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
         <Info size={20} className="text-blue-500" style={{ flexShrink: 0, marginTop: '2px' }} />
         <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-600)', margin: 0 }}>
           <b>Disclaimer:</b> HS Code classification depends on specific material composition. Please verify with a customs house agent for official filing. Confirmation will store this code in your supplier profile.
          </p>
         </div>
        </div>
       </Card>
      </div>
     )}

     {/* Step 3: Results Dashboard */}
     {step === 3 && (
      <div className="animate-fade-in">
       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>
        {/* Summary & Agreements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
         <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Globe size={20} /> Applicable Trade Agreements
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {results.map((res, i) => (
            <div key={i} style={{ padding: '1.5rem', border: '1px solid var(--neutral-gray-200)', borderRadius: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
               <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{res.agreementName}</h4>
               <span style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: res.status === 'Eligible' ? '#dcfce7' : '#fef9c3',
                color: res.status === 'Eligible' ? '#166534' : '#854d0e'
               }}>
                {res.status}
               </span>
              </div>
              <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)', textTransform: 'uppercase' }}>Preferential Duty</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-teal)' }}>{res.dutyRate}</div>
              </div>
             </div>

             <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
               <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>Estimated Landed Duty</div>
               <div style={{ fontWeight: 600 }}>{res.landedCost}</div>
              </div>
              <div>
               <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>Rules of Origin</div>
               <div style={{ fontWeight: 600 }}>CTC / 35% VA</div>
              </div>
             </div>

             <div style={{ background: 'var(--neutral-gray-50)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Info size={14} /> Rule Logic
              </div>
              <p style={{ margin: 0, color: 'var(--neutral-gray-600)' }}>{res.explanation}</p>
             </div>
            </div>
           ))}
          </div>
         </Card>

         <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <FileText size={20} /> Compliance Checklist
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           {results[0]?.requirements.map((req, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #dcfce7' }}>
             <CheckCircle2 size={18} className="text-success-green" />
             <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{req}</span>
            </div>
           ))}
           <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: '#fffbeb', borderRadius: '0.5rem', border: '1px solid #fef3c7' }}>
            <AlertTriangle size={18} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>SGS Pre-shipment Inspection</span>
           </div>
          </div>
         </Card>
        </div>

        {/* Sidebar: Score & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
         <Card style={{ padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem', background: 'var(--primary-teal)', color: 'white', borderBottomLeftRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 800 }}>AI SCORE</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-gray-500)', marginBottom: '1.5rem' }}>Export Readiness Score</h3>

          <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
             cx="60" cy="60" r="54" fill="none" stroke="var(--primary-teal)" strokeWidth="8"
             strokeDasharray="339.292"
             strokeDashoffset={339.292 * (1 - readinessScore / 100)}
             strokeLinecap="round"
             style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
           </svg>
           <div style={{ position: 'absolute', fontSize: '2rem', fontWeight: 800 }}>{readinessScore}</div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-600)', marginBottom: '1.5rem' }}>
           Your product is <b>Highly Ready</b> for export to {formData.importCountry}. 1 requirement missing.
          </p>
          <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '0.5rem' }}>
           <div style={{ width: `${readinessScore}%`, height: '100%', background: 'var(--primary-teal)', borderRadius: '2px' }} />
          </div>
         </Card>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button style={{ width: '100%', height: '3.5rem' }} leftIcon={<Download size={18} />}>Download PDF Report</Button>
          <Button variant="outline" style={{ width: '100%', height: '3.5rem' }} leftIcon={<BarChart size={18} />}>Add to Analytics</Button>
          <Button
           variant="ghost"
           style={{ width: '100%' }}
           onClick={() => !isSaving && saveCheckToFirebase(results, readinessScore)}
           isLoading={isSaving}
           leftIcon={<Save size={18} />}
          >
           {isSaving ? 'Saving...' : 'Manual Save to Profile'}
          </Button>
         </div>

         <Card style={{ padding: '1.5rem', background: 'var(--primary-teal-light)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '0.5rem' }}>Need Trade Finance?</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-600)', marginBottom: '1rem' }}>Based on this eligibility check, you qualify for pre-shipment credit up to 80% of value.</p>
          <Button size="sm" variant="outline" style={{ borderColor: 'var(--primary-teal)', color: 'var(--primary-teal)' }}>Check Credit Limit</Button>
         </Card>
        </div>
       </div>
      </div>
     )}
    </>
   ) : (
    <div className="animate-fade-in">
     {loadingHistory ? (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
       <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary-teal)', margin: '0 auto' }} />
       <p style={{ marginTop: '1rem', color: 'var(--neutral-gray-500)' }}>Loading report history...</p>
      </div>
     ) : history.length === 0 ? (
      <Card style={{ padding: '5rem', textAlign: 'center' }}>
       <div style={{ color: 'var(--neutral-gray-300)', marginBottom: '1.5rem' }}>
        <FileText size={64} style={{ margin: '0 auto' }} />
       </div>
       <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Reports Yet</h3>
       <p style={{ color: 'var(--neutral-gray-500)', marginBottom: '2rem' }}>Run your first AI trade analysis to see it here.</p>
       <Button onClick={() => setActiveTab('checker')}>Start New Analysis</Button>
      </Card>
     ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       {history.map((check) => (
        <Card key={check.id} style={{ padding: '1.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
           <div style={{ width: '3rem', height: '3rem', background: 'var(--primary-teal-light)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-teal)' }}>
            <Globe size={24} />
           </div>
           <div>
            <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{check.productName}</h4>
            <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.875rem', color: 'var(--neutral-gray-500)' }}>
             Export to <b>{check.importCountry}</b> • HS Code: {check.hsCode}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
             {check.results?.slice(0, 2).map((res: any, idx: number) => (
              <span key={idx} style={{ padding: '0.125rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
               {res.agreementName}: {res.dutyRate}
              </span>
             ))}
            </div>
           </div>
          </div>
          <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)', marginBottom: '0.25rem' }}>
            {check.timestamp?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-teal)' }}>{check.readinessScore}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-gray-400)' }}>Score</div>
           </div>
           <Button size="sm" variant="ghost" style={{ marginTop: '0.5rem' }} onClick={() => {
            setFormData({
             productName: check.productName,
             description: check.description || '',
             category: '',
             hsCode: check.hsCode || '',
             exportCountry: check.exportCountry,
             importCountry: check.importCountry,
             shipmentValue: check.shipmentValue || '',
             quantity: check.quantity || ''
            });
            setResults(check.results);
            setReadinessScore(check.readinessScore);
            setStep(3);
            setActiveTab('checker');
           }}>View Report</Button>
          </div>
         </div>
        </Card>
       ))}
      </div>
     )}
    </div>
   )}
  </div>
 );
};

const StepIndicator = ({ current, step, label }: { current: number, step: number, label: string }) => {
 const active = current >= step;
 const isCurrent = current === step;

 return (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
   <div style={{ height: '4px', background: active ? 'var(--primary-teal)' : 'var(--neutral-gray-200)', borderRadius: '2px', transition: 'all 0.3s' }} />
   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{
     width: '1.5rem',
     height: '1.5rem',
     borderRadius: '50%',
     backgroundColor: active ? 'var(--primary-teal)' : 'var(--neutral-gray-200)',
     color: active ? 'white' : 'var(--neutral-gray-500)',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     fontSize: '0.75rem',
     fontWeight: 700
    }}>
     {active && current > step ? <CheckCircle2 size={12} /> : step}
    </div>
    <span style={{
     fontSize: '0.8125rem',
     fontWeight: isCurrent ? 700 : 500,
     color: isCurrent ? 'var(--neutral-gray-900)' : 'var(--neutral-gray-400)'
    }}>
     {label}
    </span>
   </div>
  </div>
 );
};
