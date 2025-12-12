import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                    <Image src="/lindsay-precast-logo.png" alt="Lindsay Precast Logo" width={150} height={50} />
                </Link>
                <nav>
                    <ul className="flex space-x-4">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/projects">Projects</Link></li>
                        <li><Link href="/admin/dashboard">Admin</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
