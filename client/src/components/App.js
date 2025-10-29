import React, { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { HomePage } from "./homePage/HomePage";
import { ApiService } from "./ApiService";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Catalogue from "./books/Catalogue";
import BookDetail from "./books/BookDetail";
import AddBook from "./books/AddBook";
import MyLoans from "./loans/MyLoans";

export default function App() {
  const apiService = useMemo(() => new ApiService(), []);
  const [status, setStatus] = useState("");
  const [view, setView] = useState("home");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiService.healthCheck().then((s) => setStatus(s.status)).catch(() => setStatus("ERROR"));
  }, [apiService]);

  const onLogin = (data) => {
    setUser(data.user);
    setView("catalogue");
  };

  const onLogout = () => {
    apiService.logout();
    setUser(null);
    setView("home");
  };

  const openBook = (id) => {
    setSelectedBookId(id);
    setView("book");
  };

  return (
    <div>
      <Container>
        <NavBarSimple user={user} onNavigate={setView} onLogout={onLogout} />
        {view === "home" && <HomePage okStatus={status} />}
        {view === "login" && <Login api={apiService} onSuccess={onLogin} />}
        {view === "register" && <Register api={apiService} onSuccess={onLogin} />}
        {view === "catalogue" && <Catalogue api={apiService} onOpenBook={openBook} />}
        {view === "book" && selectedBookId && (
          <BookDetail api={apiService} id={selectedBookId} user={user} />
        )}
        {view === "add" && <AddBook api={apiService} user={user} />}
        {view === "loans" && <MyLoans api={apiService} user={user} />}
      </Container>
    </div>
  );
}

function NavBarSimple({ user, onNavigate, onLogout }) {
  const LinkBtn = ({ label, to }) => (
    <NavBtn onClick={() => onNavigate(to)}>{label}</NavBtn>
  );
  return (
    <NavBar>
      <Group>
        <LinkBtn label="Home" to="home" />
        <LinkBtn label="Catalogue" to="catalogue" />
        {user && <LinkBtn label="Add Book" to="add" />}
        {user && <LinkBtn label="My Loans" to="loans" />}
      </Group>
      <Group>
        {!user ? (
          <>
            <LinkBtn label="Login" to="login" />
            <LinkBtn label="Register" to="register" />
          </>
        ) : (
          <>
            <UserText>Hello, {user.username}</UserText>
            <NavBtn onClick={onLogout}>Logout</NavBtn>
          </>
        )}
      </Group>
    </NavBar>
  );
}

const NavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e6eaf5;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavBtn = styled.button`
  background: #f5f7ff;
  color: #1b2b5c;
  border: 1px solid #e6eaf5;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background: #e9edff;
    transform: translateY(-1px);
  }
`;

const UserText = styled.span`
  margin-right: 8px;
  color: #51607a;
`;
