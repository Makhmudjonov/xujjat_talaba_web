import React, { useState } from 'react'
import { CSidebar, CSidebarBrand, CSidebarNav, CNavItem, CNavTitle } from '@coreui/react'
import { CContainer } from '@coreui/react'
import { CHeader, CHeaderToggler } from '@coreui/react'
import { CFooter } from '@coreui/react'
import { Outlet } from 'react-router-dom'

const DefaultLayout = () => {
  const [visible, setVisible] = useState(true)

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <CHeader className="bg-white shadow-sm px-3">
        <CHeaderToggler
          className="ps-1 d-lg-none"
          onClick={() => setVisible(!visible)}
        />
        <h5 className="mb-0">📁 Tanlov Tizimi</h5>
      </CHeader>

      {/* Layout with Sidebar */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <CSidebar
          visible={visible}
          onVisibleChange={(val) => setVisible(val)}
          className="border-end"
          unfoldable
        //   responsive
        >
          <CSidebarBrand className="bg-primary text-white p-3 fw-bold">
            Grant Admin
          </CSidebarBrand>
          <CSidebarNav>
            <CNavTitle>Bo‘limlar</CNavTitle>
            <CNavItem href="/hujjat">
              📤 Hujjat yuborish
            </CNavItem>
            <CNavItem href="/statistika">
              📊 Statistika
            </CNavItem>
          </CSidebarNav>
        </CSidebar>

        {/* Main Content */}
        <CContainer fluid className="p-4">
          <Outlet />
        </CContainer>
      </div>

      {/* Footer */}
      <CFooter className="bg-light text-muted justify-content-center justify-content-md-between px-4 py-3 shadow-sm">
        <span>&copy; 2025 Tanlov Tizimi</span>
        <span className="d-none d-md-inline">Yaratdi: Mirazizbek</span>
      </CFooter>
    </div>
  )
}

export default DefaultLayout
