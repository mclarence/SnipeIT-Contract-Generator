import { useEffect } from "react";

interface BulkGenerateProps {
    setAppBarTitle: React.Dispatch<React.SetStateAction<string>>;
}

export default function BulkGenerate(props: BulkGenerateProps) {
    useEffect(() => {
        props.setAppBarTitle('Bulk Generate');
    }, [])

    return (
        <div>
        Bulk Generate
        </div>
    );
}