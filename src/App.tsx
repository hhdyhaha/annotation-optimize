import './App.css'
// 导入HeaderPage, FooterPage, MainPage 组件
// import HeaderPage from './components/headerPage/HeaderPage.tsx'
// import FooterPage from './components/footerPage/FooterPage.tsx'
import MainPage from './components/mainPage/MainPage.tsx'

function App() {
    return (
        <>
            {/*高度20vh,使用tailwindcss编写*/}
            {/* <div className="h-10vh">
                <HeaderPage />
            </div> */}
            {/*高度80vh*/}
            <div className="h-100vh pt-10">
                <MainPage />
            </div>
            {/* <div className="h-10vh">
                <FooterPage />
            </div> */}
        </>
    )
}

export default App