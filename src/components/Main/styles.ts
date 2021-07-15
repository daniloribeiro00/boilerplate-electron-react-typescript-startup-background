import styled from 'styled-components';

export const Container = styled.main`
	margin: 0 auto;
	background: #eee;
	border-radius: 1rem;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1rem;

	h2 {
		font-size: 1.7rem;
		font-weight: 400;
	}

	p {
		font-size: 1.4rem;
		font-weight: 400;
	}

	@media (max-width: 1200px) {
		margin-left: 1rem;
		margin-right: 1rem;
	}
`;
