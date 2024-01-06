import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// import {fetchRevenue, fetchLatestInvoices, fetchCardData,} from '@/app/lib/data'; // In this option we fetch Revenue data here
import { fetchLatestInvoices, fetchCardData } from '@/app/lib/data'; // Now we'll fetch Revenue directly on "RevenueChart" component
import { Suspense } from 'react'; // Alloes to replace component while it is loading
import { RevenueChartSkeleton } from '@/app/ui/skeletons'; // This will replace 'RevenueChart' component while it is loading

export default async function Page() {
  // const revenue = await fetchRevenue(); // In this option we were fetching Revenue data here
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* Here we were passing revenue data to RevenueChart component but now it wil fetch its own data: /> */}
        {/* <RevenueChart revenue={revenue} /> */}
        {/* Now we don't pass revenue data but we use RevenueChartSkeleton as fallback while the chard fetch data and loads: /> */}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
