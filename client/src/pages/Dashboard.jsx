import { useAuth } from '../hooks/useAuth';
import DashboardHeader from '../components/DashHeader';
import StatCards from '../components/StatCards';
import Entries from '../components/Entries';

const Dashboard = () => {

  return (
    <>
    <DashboardHeader/>
    <StatCards/>
    <Entries/>
    </>
  )
}

export default Dashboard;