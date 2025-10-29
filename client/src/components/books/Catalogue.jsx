import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from 'reactstrap';

export default function Catalogue({ api, onOpenBook }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 10 });
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.getBooks({ search, page, page_size: pageSize })
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load catalogue'));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, pageSize]);

  const onSubmit = (e) => { e.preventDefault(); setPage(1); load(); };

  return (
    <Wrapper>
      <Hero>
        <HeroTitle>The Library Catalogue</HeroTitle>
        <HeroSub>Discover, search, and borrow your next great read.</HeroSub>
        <SearchBar onSubmit={onSubmit}>
          <SearchInput
            placeholder="Search by title or author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchButton type="submit">Search</SearchButton>
        </SearchBar>
        {error && <Alert color="danger">{error}</Alert>}
      </Hero>

      <Grid>
        {data.items.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle>{b.title}</CardTitle>
              <Copies>{b.available_copies}/{b.total_copies} available</Copies>
            </CardHeader>
            <Meta>ISBN {b.isbn}</Meta>
            {b.authors && b.authors.length > 0 && (
              <Authors>by {b.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ')}</Authors>
            )}
            <Actions>
              <Primary onClick={() => onOpenBook(b.id)}>Open</Primary>
            </Actions>
          </Card>
        ))}
      </Grid>

      <Pagination>
        <PageBtn disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</PageBtn>
        <PageMeta>
          Page {data.page} of {Math.max(1, Math.ceil(data.total / (data.page_size || pageSize)))}
        </PageMeta>
        <PageBtn disabled={(data.page * (data.page_size || pageSize)) >= data.total} onClick={() => setPage(page + 1)}>Next</PageBtn>
        <PageSize value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </PageSize>
      </Pagination>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 16px 0 40px;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #eef3ff 0%, #ffffff 60%);
  border: 1px solid #e6eaf5;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
`;

const HeroTitle = styled.h2`
  margin: 0 0 6px 0;
`;

const HeroSub = styled.div`
  color: #51607a;
  margin-bottom: 16px;
`;

const SearchBar = styled.form`
  display: flex;
  gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #cfd7e6;
  border-radius: 8px;
`;

const ButtonBase = styled.button`
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
`;

const SearchButton = styled(ButtonBase)`
  background: #3452ff;
  color: white;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  border: 1px solid #e6eaf5;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const CardTitle = styled.div`
  font-weight: 600;
`;

const Copies = styled.div`
  font-size: 0.9em;
  color: #51607a;
`;

const Meta = styled.div`
  font-size: 0.9em;
  color: #51607a;
`;

const Authors = styled.div`
  font-size: 0.95em;
`;

const Actions = styled.div`
  margin-top: auto;
  padding-top: 8px;
`;

const Primary = styled(ButtonBase)`
  background: #0f9d58;
  color: white;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
`;

const PageBtn = styled(ButtonBase)`
  background: #f0f4ff;
  color: #1b2b5c;
`;

const PageMeta = styled.div`
  margin: 0 8px;
`;

const PageSize = styled.select`
  margin-left: auto;
  border: 1px solid #cfd7e6;
  border-radius: 8px;
  padding: 8px 10px;
`;
