import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-8">
            <div className="container mx-auto text-center">
                <Link href="/">
                    <a>
                        <Image src="/lindsay-precast-logo.png" alt="Lindsay Precast Logo" width={150} height={50} />
                    </a>
                </Link>
                <p className="mt-4">© {new Date().getFullYear()} Lindsay Precast. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
