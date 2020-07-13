import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography } from "@material-ui/core";

import Token from "../../containers/Token";
import Connection from "../../containers/Connection";

const AllPositions = () => {
    const { symbol: tokenSymbol } = Token.useContainer();

    if (tokenSymbol === null) {
        return (
          <Container>
            <Box py={2}>
              <Typography>
                <i>Please first select an EMP from the dropdown above.</i>
              </Typography>
            </Box>
          </Container>
        );
    }

    const getEstimatedPrice = () => {
        if (tokenSymbol?.includes("yCOMP")) {
            return 187;
        } else {
            return 0.0259;
        }
    }

    const createSponsorData = (address: string, collateral: number, tokens: number, liqs: number) => {
        return { 
            address, 
            collateral, 
            tokens, 
            cRatio: (tokens / (collateral * getEstimatedPrice())), 
            liqs
        };
    }

    const rows = (tokenSymbol?.includes("yCOMP") ? [
        createSponsorData('0x1BAE75724Ac6765D6A7306b41b4E7aAa2aCC8B5d', 1, 412.5, 0),
        createSponsorData('0xD1F55571cbB04139716a9a5076Aa69626B6df009', 350, 170000, 1),
        createSponsorData('0xd165164cbAb65004Da73C596712687C16b981274', 1, 700, 0),
        createSponsorData('0x6408c3deE9Aa842db991a1B2fc0ae94D6354724b', 1, 800, 0),
        createSponsorData('0xD38D3b64504480945F482c03670352CA35679630', 1, 488, 0)
    ] : [
        createSponsorData('0x367f62F022E0c8236d664fBA35b594591270Dafb', 1500000, 56250, 2),
        createSponsorData('0x2e4dE42F0b8ac51D435bd98121Af106388D911Bd', 90000, 4000, 1),
        createSponsorData('0x74d1bf5ECeEeFc91c61D53c3eDaC9c1173A97853', 500000, 18750, 0),
        createSponsorData('0xd6D30F186E802c1558b8137bd730f7f4AEC17aE7', 1000, 38, 0),
        createSponsorData('0x3F603a18Bed7cc5CeEFdC83ff1CE0CF5B3764e2e', 1000, 40, 0)

    ]);

    return (
        <Box py={4}>
        <TableContainer component={Paper}>
        <Table>
            <TableHead>
            <TableRow>
                <TableCell>Active Sponsor</TableCell>
                <TableCell align="right">Locked Collateral</TableCell>
                <TableCell align="right">Tokens Outstanding</TableCell>
                <TableCell align="right">Collateral Ratio (estimated price: {getEstimatedPrice()})</TableCell>
                <TableCell align="right">Pending Liquidations</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {rows.map((row) => (
                <TableRow key={row.address}>
                <TableCell component="th" scope="row">
                    {row.address}
                </TableCell>
                <TableCell align="right">{row.collateral}</TableCell>
                <TableCell align="right">{row.tokens}</TableCell>
                <TableCell align="right">{row.cRatio}</TableCell>
                <TableCell align="right">{row.liqs}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
            </TableContainer>
        </Box>
    );
};

export default AllPositions;
