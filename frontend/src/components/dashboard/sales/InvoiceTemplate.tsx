import React from "react";

export interface InvoiceData {
  transactionId: string;
  createdAt?: string;
  clientName?: string;
  basket: any[];
  finalTotal: number;
  discountApplied: number;
  paymentMethod: string;
  amountTendered: number;
  changeDue: number;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, { data: InvoiceData }>(({ data }, ref) => {
  return (
    <div 
      ref={ref} 
      className="bg-white text-slate-900 p-12 max-w-4xl mx-auto w-full font-sans antialiased print:p-0 print:text-black print:bg-white scroll-smooth" 
      style={{ minHeight: "297mm" }} // Standard A4 ratio baseline
    >
  
      {/* Header Section */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8 mt-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img 
              src="/icon.svg" 
              alt="Logo" 
              className="w-12 h-12 object-contain" 
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">IMANE TECH STORE</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gaming • Hardware • Accessories</p>
            </div>
          </div>
          
          <div className="text-xs text-slate-500 space-y-0.5 pt-2">
            <p className="font-medium text-slate-700">Casablanca, Morocco</p>
            <p>Contact: +212 6 00 00 00 00</p>
            <p>Email: contact@imanetech.ma</p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end justify-between h-full min-h-[120px]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Facture / Receipt</span>
            <h2 className="text-xl font-mono font-bold text-slate-950 bg-slate-100 px-3 py-1 rounded">
              #{data.transactionId || "NEW"}
            </h2>
          </div>
        </div>
      </div>

      {/* Metadata & Billing Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0 print:grid-cols-2 m-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facturé à / Bill To</h3>
          <p className="text-lg font-bold text-slate-900">{data.clientName || "Walk-in Customer"}</p>
          <p className="text-xs text-slate-500 mt-1">Client ID: #{(data.clientName ? data.clientName.slice(0,3).toUpperCase() : "CUST")}-IMN</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date d'émission</h3>
            <p className="text-sm font-semibold text-slate-800">
              {data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Règlement</h3>
            <span className="inline-block text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wide print:text-black print:border print:border-black print:bg-transparent">
              {data.paymentMethod || "CASH"}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table / Grid */}
      <div className="mb-8 mx-4">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-t-lg print:bg-slate-100 print:text-black print:border-b print:border-slate-300">
          <div className="col-span-6">Désignation Produit</div>
          <div className="col-span-2 text-center">Qté</div>
          <div className="col-span-2 text-right">Prix Unitaire</div>
          <div className="col-span-2 text-right">Montant</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-lg overflow-hidden print:border-none">
          {data.basket?.map((item: any, i: number) => {
            const unitPrice = Number(item.product?.sellPrice || item.price || item.unitPrice || 0);
            const lineAmount = item.quantity * unitPrice;
            
            return (
              <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-slate-50/50 transition-colors print:py-3">
                <div className="col-span-6">
                  <p className="font-semibold text-sm text-slate-900">{item.product?.name || "Product Item"}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">SKU: #{item.product?.id || "N/A"}</p>
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-slate-800">
                  {item.quantity}
                </div>
                <div className="col-span-2 text-right text-sm font-medium text-slate-600">
                  {unitPrice.toFixed(2)} DH
                </div>
                <div className="col-span-2 text-right text-sm font-bold text-slate-950">
                  {lineAmount.toFixed(2)} DH
                </div>
              </div>
            );
          })}
          
          {(!data.basket || data.basket.length === 0) && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucun article dans le panier.
            </div>
          )}
        </div>
      </div>

      {/* Financial Calculations Area */}
      <div className="flex justify-end mb-12 mr-4 mt-10 ">
        <div className="w-80 space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Sous-total</span>
            <span className="font-semibold text-slate-800">
              {(data.basket?.reduce((acc: number, item: any) => acc + (Number(item.product?.sellPrice || item.price || item.unitPrice || 0) * item.quantity), 0) || 0).toFixed(2)} DH
            </span>
          </div>
          
          <div className="flex justify-between text-sm text-slate-600">
            <span>Remise / Discount</span>
            <span className="font-semibold text-emerald-600">
              - {(data.discountApplied || 0).toFixed(2)} DH
            </span>
          </div>
          
          <div className="border-t border-slate-200 my-2 pt-3 flex justify-between items-center ">
            <span className="text-md font-bold uppercase tracking-wider text-slate-900 font-serif ">Total Net </span>
            <span className="text-xl font-black text-slate-950">
              {(data.finalTotal || 0).toFixed(2)} DH
            </span>
          </div>

          {/* Cash Details Details */}
          {data.paymentMethod === "CASH" && (
            <div className="pt-3 border-t border-dashed border-slate-200 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Espèce Reçu</span>
                <span>{(data.amountTendered || 0).toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Rendu / Change Due</span>
                <span className="font-mono">{(data.changeDue || 0).toFixed(2)} DH</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Legal Footer */}
      <div className="text-center pt-10 border-t border-slate-200 mt-auto space-y-1">
        <p className="text-sm font-bold text-slate-800">Merci pour votre confiance !</p>
        <p className="text-xs text-slate-400 mt-2">
          Les marchandises sont garanties selon les conditions constructeurs. Conservez ce ticket comme preuve d'achat.
        </p>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pt-2">
          Powered by Imane Ellaouzi -  Inventory System
        </p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";