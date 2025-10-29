import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export default function BookDetail({ api, id, user }) {
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [dueDate, setDueDate] = useState('');
  const load = () => {
    setError('');
    api.getBook(id).then(setBook).catch((e) => setError(e.message || 'Failed to load book'));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const borrow = () => {
    if (!dueDate) { setError('Please select a due date'); return; }
    api.borrow({ book_id: id, dueDate })
      .then(() => { setDueDate(''); load(); })
      .catch((e) => setError(e.message || 'Borrow failed'));
  };

  if (!book) return <div>Loading...</div>;
  return (
    <Wrapper>
      <Header>
        <Title>{book.title}</Title>
        <Copies>{book.available_copies} / {book.total_copies} available</Copies>
      </Header>

      <MetaRow>
        <MetaLabel>ISBN</MetaLabel>
        <MetaValue>{book.isbn}</MetaValue>
      </MetaRow>
      {book.authors && book.authors.length > 0 && (
        <MetaRow>
          <MetaLabel>Authors</MetaLabel>
          <MetaValue>{book.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ')}</MetaValue>
        </MetaRow>
      )}

      <Section>
        <SectionTitle>Borrowers</SectionTitle>
        {(book.borrowers && book.borrowers.length > 0) ? (
          <BorrowerList>
            {book.borrowers.map((br, i) => (
              <BorrowerItem key={i}>
                <span>{br.user ? br.user.username : 'Unknown user'}</span>
                <Due>due {br.dueDate}</Due>
              </BorrowerItem>
            ))}
          </BorrowerList>
        ) : <Muted>No active borrows.</Muted>}
      </Section>

      <Section>
        <SectionTitle>Borrow this book</SectionTitle>
        {user ? (
          <BorrowPanel>
            <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Primary disabled={book.available_copies <= 0} onClick={borrow}>Borrow</Primary>
          </BorrowPanel>
        ) : (
          <Muted>Login to borrow</Muted>
        )}
      </Section>

      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: #fff;
  border: 1px solid #e6eaf5;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
`;

const Copies = styled.div`
  color: #51607a;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
`;

const MetaLabel = styled.div`
  color: #51607a;
`;

const MetaValue = styled.div``;

const Section = styled.div`
  margin-top: 8px;
`;

const SectionTitle = styled.h3`
  margin: 8px 0;
`;

const BorrowerList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BorrowerItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid #e6eaf5;
  border-radius: 8px;
`;

const Due = styled.span`
  color: #1b2b5c;
`;

const BorrowPanel = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #cfd7e6;
  border-radius: 8px;
`;

const Primary = styled.button`
  background: #0f9d58;
  color: white;
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
`;

const Muted = styled.div`
  color: #6b7a92;
`;

const ErrorText = styled.div`
  color: #b00020;
  margin-top: 8px;
`;
