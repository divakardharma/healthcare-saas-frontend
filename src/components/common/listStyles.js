import styled from "styled-components";

export const PHONE = "480px";
export const TABLET = "700px";
export const SMALL = "360px";
export const TINY = "280px";
export const CARD_LAYOUT_MAX_WIDTH = "1199px";

/* ---------- Page shell (same as Patients) ---------- */

export const PageShell = styled.div`
  width: 100%;
  max-width: 1600px;
  min-width: 0;
  margin: 0 auto;
`;

export const CardsOnly = styled.div`
  display: none;

  @media (max-width: ${CARD_LAYOUT_MAX_WIDTH}) {
    display: block;
  }
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 12px;

  @media (max-width: ${PHONE}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;

  @media (max-width: ${TINY}) {
    flex-wrap: wrap;
  }
`;

export const CardName = styled.h3`
  margin: 0;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const IdBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.disabled};

  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

export const Details = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 8px 12px;
  margin: 0;

  dt {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  dd {
    margin: 2px 0 0;
    font-size: 14px;
    overflow-wrap: anywhere;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: ${TINY}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const IdText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`;

export const NameText = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;

  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${TABLET}) {
    justify-content: center;
  }
`;

export const PaginationInfo = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: ${TABLET}) {
    width: 100%;
    text-align: center;
  }
`;

export const PageIndicator = styled.span`
  min-width: 84px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: ${PHONE}) {
    flex: 0 0 auto;
    min-width: 0;
    font-size: 13px;
  }
`;