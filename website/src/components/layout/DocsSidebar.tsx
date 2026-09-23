import { NavLink } from 'react-router-dom';
import { NAV } from '../../content/nav';

export interface DocsSidebarProps {
    /** Called after a link is followed — used to close the mobile drawer. */
    onNavigate?(): void;
}

/** Grouped navigation for every documentation page, driven by `nav.ts`. */
export function DocsSidebar({ onNavigate }: DocsSidebarProps) {
    return (
        <nav aria-label="Documentation">
            {NAV.map((section) => (
                <div className="sidebar-group" key={section.group}>
                    <h4>{section.group}</h4>
                    <ul>
                        {section.items.map((item) => (
                            <li key={item.slug}>
                                <NavLink
                                    to={item.slug}
                                    onClick={onNavigate}
                                    className={({ isActive }) => (isActive ? 'active' : undefined)}
                                >
                                    {item.title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
