
'use client';

import { Icon } from "@iconify/react";

export default function PaymentIcons() {
  return (
    <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
      <Icon icon="simple-icons:mpesa" className="text-[40px] text-green-600" />
      <Icon icon="logos:paypal" className="text-[40px]" />
      <Icon icon="logos:stripe" className="text-[40px]" />
      <Icon icon="logos:mastercard" className="text-[40px]" />
      <Icon icon="logos:visa" className="text-[40px]" />
    </div>
  );
}
