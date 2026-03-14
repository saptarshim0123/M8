import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const AppLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen">

            <div className="hidden md:flex">
                <Sidebar />
            </div>

            <main className="flex-1 pb-20 md:pb-0">
                {children}
            </main>

            <BottomNav />

        </div>
    )
}

export default AppLayout