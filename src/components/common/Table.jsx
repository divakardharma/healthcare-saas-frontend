import styled from "styled-components";

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.disabled};
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const EmptyMessage = styled.td`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function Table({ columns, data }) {
  return (
    <TableWrapper>
      <StyledTable>
        <TableHead>
          <tr>
            {columns.map((column) => (
              <TableHeader key={column.key}>
                {column.label}
              </TableHeader>
            ))}
          </tr>
        </TableHead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </TableCell>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <EmptyMessage colSpan={columns.length}>
                No data available
              </EmptyMessage>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
}

export default Table;