import { useCallback, useEffect, useContext, useMemo } from "react";
import { useSnackbar } from "@saas-ui/react";
import { Context } from "./context";
import { provider } from "./ethers";

export function useWallet({ sync = false, auto = true } = {}) {
    const {
        account,
        setAccount,
        balance,
        setBalance,
        ethProvider,
        setProvider,
        network,
    } = useContext(Context);

    const snackbar = useSnackbar();

    const connected = useMemo(() => (account?.length > 0 ? account[0] : null), [
        account,
    ]);

    const connectWallet = useCallback(() => {
        if (sync) setProvider(provider.ethersSync(network));
        else
            provider
                .ethers(network)
                .catch(() => snackbar("Failed to connect to the network"))
                .then(setProvider);
    }, [sync, network, setProvider]);

    const disconnectWallet = useCallback(() => {
        setAccount([]);
        setBalance(0);
        provider.clearCachedProvider();
        setProvider(null);
        snackbar.error("Disconnected from wallet");
    }, []);

    const syncProvider = useCallback(() => {
        setProvider(provider.ethersSync(network));
    }, [network, setProvider]);

    useEffect(() => {
        if (auto) connectWallet();
    }, [auto, connectWallet]);

    useEffect(() => {
        ethProvider
            ?.listAccounts()
            .then(setAccount)
            .then(() => snackbar("Wallet connected successfully!"));
    }, [ethProvider?.listAccounts, setAccount]);

    useEffect(() => {
        if (connected) ethProvider?.getBalance(connected).then(setBalance);
    }, [ethProvider?.getBalance, account, connected, setBalance]);

    return {
        balance,
        account,
        connected,
        provider: ethProvider,
        get isConnected() {
            return account?.length > 0;
        },
        get address() {
            return this.connected
                ? this.connected.slice(0, 6) + "..." + this.connected.slice(-4)
                : null;
        },
        connectWallet,
        disconnectWallet,
        syncProvider,
    };
}
