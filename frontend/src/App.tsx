import {useEffect,useState,useMemo} from 'react';
import {Navigate,NavLink,Outlet,Route,Routes,useNavigate,useSearchParams} from 'react-router-dom';
import {useAuth} from './context/AuthContext';
import {api} from './api/axios';

type NavItem = [string,string];
const navItems:NavItem[] = [
  ['Dashboard','/'],
  ['Customers','/customers'],
  ['Products','/products'],
  ['Challans','/challans'],
  ['Invoices','/invoices'],
  ['Low Stock','/low-stock'],
  ['Users','/users'],
];

function Layout(){
  const {user,logout} = useAuth();
  const [searchText,setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setSearchText('');
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const allowed = (path:string) =>
    user.role === 'Admin' ||
    (path !== '/users' && path !== '/invoices') ||
    (path === '/invoices' && user.role === 'Accounts');

  const handleSearchSubmit = () => {
    const query = searchText.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span className="logo">N</span>
          <div>
            <b>NOVA</b>
            <small>Operations</small>
          </div>
        </div>
        <div className="role">{user.role} workspace</div>
        <nav>
          {navItems.filter(([, path]) => allowed(path)).map(([title,path]) => (
            <NavLink key={path} to={path} className={({isActive}) => isActive ? 'active' : ''}>
              <span>{({Dashboard:'⌂',Customers:'◉',Products:'▦',Challans:'◫',Invoices:'₹','Low Stock':'⚠',Users:'⚙'} as any)[title]}</span>
              {title}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={logout}>↪ Sign out</button>
        </div>
      </aside>
      <main>
        <header>
          <div className="search">
            <span>⌕</span>
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Search customers, products, challans..."
            />
            <button type="button" className="secondary" onClick={handleSearchSubmit}>Search</button>
          </div>
          <div className="profile" onClick={() => navigate('/profile')}>
            <div className="avatar">{user.name[0].toUpperCase()}</div>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

function Login(){
  const {user,login} = useAuth();
  const [email,setEmail] = useState('admin@nova.local');
  const [password,setPassword] = useState('Admin@123');
  const [error,setError] = useState('');
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event:React.FormEvent) => {
    event.preventDefault();
    try {
      await login(email,password);
      navigate('/');
    } catch (err:any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand center">
          <span className="logo">N</span>
          <div>
            <b>NOVA</b>
            <small>Operations Portal</small>
          </div>
        </div>
        <h1>Run the business smarter.</h1>
        <p>One calm workspace for sales, inventory, finance and control.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <div className="error">{error}</div>}
          <button className="primary">Sign in</button>
        </form>
        <div className="signup-row">
          No account? <button type="button" className="link" onClick={() => navigate('/register')}>Create one</button>
        </div>
        <div className="demo">Demo: admin@nova.local / Admin@123</div>
      </div>
    </div>
  );
}

function Register(){
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState<'Sales'|'Warehouse'|'Accounts'>('Sales');
  const [error,setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event:React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/register',{name,email,password,role});
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err:any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand center">
          <span className="logo">N</span>
          <div>
            <b>NOVA</b>
            <small>Operations Portal</small>
          </div>
        </div>
        <h1>Create your account.</h1>
        <p>Register as a Sales, Warehouse or Accounts user.</p>
        <form onSubmit={handleRegister}>
          <label>Name<input value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Email<input value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <label>Role<select value={role} onChange={e => setRole(e.target.value as any)}>
            <option value="Sales">Sales</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Accounts">Accounts</option>
          </select></label>
          {error && <div className="error">{error}</div>}
          <button className="primary">Create account</button>
        </form>
        <div className="signup-row">
          Already have an account? <button type="button" className="link" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

function PageTitle({title,sub,button}:{title:string;sub?:string;button?:React.ReactNode}){
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {button}
    </div>
  );
}

function Metric({title,value,hint,icon}:{title:string;value:any;hint:string;icon:string}){
  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </div>
  );
}

function Card({title,action,children}:{title:string;action?:string;children:React.ReactNode}){
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {action && <span>{action}</span>}
      </div>
      {children}
    </div>
  );
}

function Loader(){
  return <div className="loading">Loading workspace…</div>;
}

function Empty({text='Nothing here yet.'}:{text?:string}){
  return (
    <div className="empty">
      <div>◫</div>
      <b>{text}</b>
      <span>Try another search or create a new record.</span>
    </div>
  );
}

function Dashboard(){
  const [data,setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard').then(response => setData(response.data)).catch(() => setData(null));
  }, []);

  if (!data) return <Loader />;

  return (
    <>
      <PageTitle title="Good evening 👋" sub="Here’s the pulse of your distribution operation." />
      <div className="cards">
        <Metric title="Follow-ups due" value={data.followupsDue} hint="Today" icon="◷" />
        <Metric title="Stale leads" value={data.staleLeads} hint="7+ days" icon="◌" />
        <Metric title="Monthly challans" value={data.monthChallans} hint={`${data.monthQuantity} units sold`} icon="◫" />
        <Metric title="Monthly revenue" value={'₹' + Number(data.monthRevenue).toLocaleString()} hint="Confirmed invoices" icon="₹" />
      </div>
      <div className="grid2">
        <Card title="Top customers" action="This month">
          <table>
            <thead>
              <tr><th>Customer</th><th>Challans</th><th>Momentum</th></tr>
            </thead>
            <tbody>
              {data.topCustomers.map((row:any) => (
                <tr key={row.id}>
                  <td><b>{row.name}</b></td>
                  <td>{row.volume}</td>
                  <td><div className="bar"><i style={{width: Math.min(100,row.volume*20)+'%'}} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Inventory watch" action="Low stock">
          <div className="stock-callout">
            <div className="big">{data.lowStock}</div>
            <div>
              <b>items need attention</b>
              <p>Restock before the next dispatch cycle.</p>
            </div>
          </div>
          <NavLink className="button secondary" to="/low-stock">Open low-stock list →</NavLink>
        </Card>
      </div>
    </>
  );
}

function GenericList({type}:{type:'customers'|'products'|'challans'}){
  const [searchParams,setSearchParams] = useSearchParams();
  const [results,setResults] = useState<any>({data:[],total:0,page:1,limit:20});
  const [query,setQuery] = useState(searchParams.get('search') || '');
  const navigate = useNavigate();

  const title = useMemo(() => type[0].toUpperCase() + type.slice(1), [type]);

  const load = async (search = query) => {
    const response = await api.get(`/${type}`, {
      params: {search, page: 1, limit: 20},
    });
    setResults(response.data);
  };

  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    setQuery(searchValue);
    load(searchValue);
  }, [type, searchParams]);

  const handleSearch = () => setSearchParams(query ? {search: query} : {});

  const handleCreate = () => {
    navigate(`/${type}/new`);
  };

  return (
    <>
      <PageTitle title={title} sub={`${results.total} records`} button={<button className="primary" onClick={handleCreate}>+ New {title.slice(0,-1)}</button>} />
      <div className="toolbar">
        <input
          placeholder={`Search ${title.toLowerCase()}...`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="secondary" onClick={handleSearch}>Search</button>
      </div>
      <Card title={`${title} directory`}>
        <table>
          <thead>
            <tr>
              {type === 'customers' ? (
                <><th>Name</th><th>Business</th><th>Type</th><th>Status</th><th>Follow-up</th></>
              ) : type === 'products' ? (
                <><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Price</th></>
              ) : (
                <><th>Challan</th><th>Customer</th><th>Status</th><th>Qty</th><th>Value</th></>
              )}
            </tr>
          </thead>
          <tbody>
            {results.data.map((item:any) => (
              <tr key={item.id}>
                {type === 'customers' ? (
                  <>
                    <td><b>{item.name}</b><small>{item.mobile}</small></td>
                    <td>{item.business_name || '—'}</td>
                    <td>{item.customer_type || '—'}</td>
                    <td><span className={`pill ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                    <td>{item.follow_up_date || '—'}</td>
                  </>
                ) : type === 'products' ? (
                  <>
                    <td><b>{item.name}</b></td>
                    <td className="mono">{item.sku}</td>
                    <td>{item.category || '—'}</td>
                    <td><span className={item.current_stock <= item.min_stock_alert ? 'stock-low' : ''}>{item.current_stock}</span></td>
                    <td>₹{Number(item.unit_price).toLocaleString()}</td>
                  </>
                ) : (
                  <>
                    <td className="mono">{item.challan_number}</td>
                    <td>{item.customer_name}</td>
                    <td><span className={`pill ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                    <td>{item.total_quantity}</td>
                    <td>₹{Number(item.value).toLocaleString()}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!results.data.length && <Empty />}
      </Card>
    </>
  );
}

function LowStock(){
  const [data,setData] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products/low-stock').then(response => setData(response.data)).catch(() => setData([]));
  }, []);

  return (
    <>
      <PageTitle title="Low-stock control" sub="Every item at or below its reorder threshold." />
      <Card title="Restock queue">
        <table>
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Available</th><th>Alert at</th><th>Warehouse</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td><b>{item.name}</b></td>
                <td className="mono">{item.sku}</td>
                <td className="stock-low">{item.current_stock}</td>
                <td>{item.min_stock_alert}</td>
                <td>{item.warehouse_location || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && <Empty text="Inventory is healthy. Nice." />}
      </Card>
    </>
  );
}

function SearchResults(){
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<any>({customers:[],products:[],challans:[]});
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (!query.trim()) return;
    api.get('/search',{params:{q:query}}).then(response => setResults(response.data)).catch(() => setResults({customers:[],products:[],challans:[]}));
  }, [query]);

  return (
    <>
      <PageTitle title="Search results" sub={query ? `Showing matches for “${query}”` : 'Type a search term in the header'} />
      {!query ? (
        <Card title="Ready to search"><p>Enter a keyword in the top search bar and press Enter.</p></Card>
      ) : (
        <div className="grid2">
          <Card title="Customers">{results.customers.length ? results.customers.map((item:any) => (
            <div key={item.id} className="item-row"><NavLink to={`/customers?search=${encodeURIComponent(query)}`}>{item.name}</NavLink></div>
          )) : <Empty text="No customer matches." />}</Card>
          <Card title="Products">{results.products.length ? results.products.map((item:any) => (
            <div key={item.id} className="item-row"><NavLink to={`/products?search=${encodeURIComponent(query)}`}>{item.name || item.sku}</NavLink></div>
          )) : <Empty text="No product matches." />}</Card>
          <Card title="Challans">{results.challans.length ? results.challans.map((item:any) => (
            <div key={item.id} className="item-row"><NavLink to={`/challans?search=${encodeURIComponent(query)}`}>{item.challan_number}</NavLink></div>
          )) : <Empty text="No challan matches." />}</Card>
        </div>
      )}
    </>
  );
}

function Profile(){
  const {user,logout} = useAuth();
  const navigate = useNavigate();
  const [activities,setActivities] = useState<any[]>([]);
  const [activityError,setActivityError] = useState('');
  const [isLoading,setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'Admin') {
      setActivities([
        {label: 'Viewed dashboard', detail: 'Checked sales pulse', when: 'Today'},
        {label: 'Opened customers', detail: 'Reviewed account list', when: 'Yesterday'},
        {label: 'Checked low stock', detail: 'Inspected inventory alerts', when: '2 days ago'},
      ]);
      setIsLoading(false);
      return;
    }

    api.get('/users/audit', {params: {page: 1, limit: 5}})
      .then(response => {
        setActivities(response.data.data.map((item:any) => ({
          label: `${item.action} ${item.entity_type}`,
          detail: item.details || `by ${item.user_name || 'system'}`,
          when: new Date(item.created_at).toLocaleString(),
        })));
      })
      .catch(() => {
        setActivityError('Unable to load activity.');
        setActivities([]);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const summaryLabel = user.role === 'Admin'
    ? 'Full Platform Access'
    : user.role === 'Accounts'
      ? 'Accounts & Reporting'
      : user.role === 'Warehouse'
        ? 'Inventory Operations'
        : 'Sales & CRM';

  const sectionCounts = {
    Admin: 7,
    Sales: 5,
    Warehouse: 4,
    Accounts: 3,
  } as const;

  const quickActions = user.role === 'Accounts' ? [
    {label: 'View invoices', path: '/invoices', variant: 'primary'},
    {label: 'Create customer', path: '/customers/new', variant: 'secondary'},
    {label: 'Create challan', path: '/challans/new', variant: 'secondary'},
  ] : user.role === 'Sales' ? [
    {label: 'Create customer', path: '/customers/new', variant: 'primary'},
    {label: 'Create challan', path: '/challans/new', variant: 'secondary'},
    {label: 'View invoices', path: '/invoices', variant: 'secondary'},
  ] : user.role === 'Warehouse' ? [
    {label: 'Create challan', path: '/challans/new', variant: 'primary'},
    {label: 'Create customer', path: '/customers/new', variant: 'secondary'},
    {label: 'View invoices', path: '/invoices', variant: 'secondary'},
  ] : [
    {label: 'Create customer', path: '/customers/new', variant: 'primary'},
    {label: 'Create challan', path: '/challans/new', variant: 'secondary'},
    {label: 'View invoices', path: '/invoices', variant: 'secondary'},
  ];

  const quickHeading = user.role === 'Accounts'
    ? 'Finance shortcuts'
    : user.role === 'Sales'
      ? 'Sales shortcuts'
      : user.role === 'Warehouse'
        ? 'Warehouse shortcuts'
        : 'Quick actions';

  const quickSubtitle = user.role === 'Accounts'
    ? 'Finance workflow recommended'
    : user.role === 'Sales'
      ? 'Top actions for your sales day'
      : user.role === 'Warehouse'
        ? 'Inventory actions ready to go'
        : 'Recommended for your role';

  return (
    <>
      <PageTitle title="Profile" sub="Your current user details." />
      <div className="profile-header-grid">
        <div className="profile-summary-card">
          <div className="profile-summary-avatar">{user.name[0].toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{summaryLabel}</p>
            <div className="profile-badges">
              <span>{user.role}</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        <div className="profile-stat-grid">
          <div className="profile-stat-card">
            <strong>{sectionCounts[user.role] || 4}</strong>
            <span>Enabled sections</span>
          </div>
          <div className="profile-stat-card">
            <strong>100%</strong>
            <span>Profile completeness</span>
          </div>
          <div className="profile-stat-card">
            <strong>{user.role === 'Admin' ? 'High' : 'Standard'}</strong>
            <span>Permission level</span>
          </div>
        </div>
      </div>
      <div className="profile-activity-grid">
        <div className="profile-activity-card">
          <h3>Recent activity</h3>
          {isLoading ? (
            <div className="activity-empty">Loading recent activity…</div>
          ) : activityError ? (
            <div className="activity-empty">{activityError}</div>
          ) : activities.length ? (
            <ul className="activity-list">
              {activities.map((item, index) => (
                <li key={index}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                  <small>{item.when}</small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="activity-empty">No recent activity available.</div>
          )}
        </div>
        <div className="profile-quick-actions-card">
          <h3>{quickHeading}</h3>
          <p>{quickSubtitle}</p>
          <div className="quick-actions-list">
            {quickActions.map(action => (
              <button
                key={action.label}
                className={action.variant}
                onClick={() => navigate(action.path)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Card title="Account details">
        <div className="profile-panel">
          <div><strong>Name</strong><span>{user.name}</span></div>
          <div><strong>Email</strong><span>{user.email}</span></div>
          <div><strong>Role</strong><span>{user.role}</span></div>
        </div>
        <div className="row-buttons">
          <button className="secondary" onClick={() => navigate('/')}>Back to dashboard</button>
          <button className="primary" onClick={logout}>Sign out</button>
        </div>
      </Card>
    </>
  );
}

function CreateCustomer(){
  const [form, setForm] = useState({name:'',mobile:'',email:'',business_name:'',gst_number:'',customer_type:'Retail',address:'',status:'Lead',follow_up_date:'',notes:''});
  const [error,setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event:React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/customers', form);
      navigate('/customers');
    } catch (err:any) {
      setError(err.response?.data?.message || 'Could not save customer');
    }
  };

  return (
    <>
      <PageTitle title="New customer" sub="Add a customer so you can create challans." />
      <Card title="Customer details">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Name<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required /></label>
          <label>Phone<input value={form.mobile} onChange={e => setForm({...form,mobile:e.target.value})} required /></label>
          <label>Email<input value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></label>
          <label>Business name<input value={form.business_name} onChange={e => setForm({...form,business_name:e.target.value})} /></label>
          <label>Customer type<select value={form.customer_type} onChange={e => setForm({...form,customer_type:e.target.value})}>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select></label>
          <label>Status<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select></label>
          <label>Follow up date<input type="date" value={form.follow_up_date} onChange={e => setForm({...form,follow_up_date:e.target.value})} /></label>
          <label>Notes<textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></label>
          {error && <div className="error">{error}</div>}
          <div className="row-buttons">
            <button className="secondary" type="button" onClick={() => navigate('/customers')}>Cancel</button>
            <button className="primary" type="submit">Save customer</button>
          </div>
        </form>
      </Card>
    </>
  );
}

function CreateProduct(){
  const [form, setForm] = useState({name:'',sku:'',category:'',unit_price:'',current_stock:'',min_stock_alert:'',warehouse_location:''});
  const [error,setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event:React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/products', {
        name: form.name,
        sku: form.sku,
        category: form.category,
        unit_price: Number(form.unit_price),
        current_stock: Number(form.current_stock),
        min_stock_alert: Number(form.min_stock_alert),
        warehouse_location: form.warehouse_location,
      });
      navigate('/products');
    } catch (err:any) {
      setError(err.response?.data?.message || 'Could not save product');
    }
  };

  return (
    <>
      <PageTitle title="New product" sub="Add stock so your team can create challans." />
      <Card title="Product details">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Product name<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required /></label>
          <label>SKU<input value={form.sku} onChange={e => setForm({...form,sku:e.target.value})} required /></label>
          <label>Category<input value={form.category} onChange={e => setForm({...form,category:e.target.value})} /></label>
          <label>Unit price<input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form,unit_price:e.target.value})} required /></label>
          <label>Current stock<input type="number" value={form.current_stock} onChange={e => setForm({...form,current_stock:e.target.value})} required /></label>
          <label>Reorder alert<input type="number" value={form.min_stock_alert} onChange={e => setForm({...form,min_stock_alert:e.target.value})} required /></label>
          <label>Warehouse<input value={form.warehouse_location} onChange={e => setForm({...form,warehouse_location:e.target.value})} /></label>
          {error && <div className="error">{error}</div>}
          <div className="row-buttons">
            <button className="secondary" type="button" onClick={() => navigate('/products')}>Cancel</button>
            <button className="primary" type="submit">Save product</button>
          </div>
        </form>
      </Card>
    </>
  );
}

function CreateChallan(){
  const [customers,setCustomers] = useState<any[]>([]);
  const [products,setProducts] = useState<any[]>([]);
  const [customerId,setCustomerId] = useState('');
  const [items,setItems] = useState([{product_id:'',quantity:'1'}]);
  const [error,setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/customers',{params:{limit:50}}).then(resp => setCustomers(resp.data.data || [])).catch(() => setCustomers([]));
    api.get('/products',{params:{limit:50}}).then(resp => setProducts(resp.data.data || [])).catch(() => setProducts([]));
  }, []);

  const updateItem = (index:number, field:'product_id'|'quantity', value:string) => {
    const next = [...items];
    next[index] = {...next[index],[field]:value};
    setItems(next);
  };

  const addItem = () => setItems([...items,{product_id:'',quantity:'1'}]);
  const removeItem = (index:number) => setItems(items.filter((_,i) => i !== index));

  const handleSubmit = async (event:React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/challans', {
        customer_id: Number(customerId),
        items: items.filter(item => item.product_id).map(item => ({product_id:Number(item.product_id),quantity:Number(item.quantity)})),
      });
      navigate('/challans');
    } catch (err:any) {
      setError(err.response?.data?.message || 'Could not create challan');
    }
  };

  return (
    <>
      <PageTitle title="New challan" sub="Create a new challan from customers and products." />
      <Card title="Challan details">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Customer<select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
          <div className="items-list">
            <div className="items-header"><strong>Items</strong> <button type="button" className="secondary" onClick={addItem}>Add item</button></div>
            {items.map((item,index) => (
              <div key={index} className="item-row">
                <select value={item.product_id} onChange={e => updateItem(index,'product_id',e.target.value)} required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index,'quantity',e.target.value)} required />
                <button type="button" className="link" onClick={() => removeItem(index)}>Remove</button>
              </div>
            ))}
          </div>
          {error && <div className="error">{error}</div>}
          <div className="row-buttons">
            <button className="secondary" type="button" onClick={() => navigate('/challans')}>Cancel</button>
            <button className="primary" type="submit">Save challan</button>
          </div>
        </form>
      </Card>
    </>
  );
}

function Invoices(){
  const [data,setData] = useState<any>({data:[]});

  useEffect(() => {
    api.get('/invoices').then(response => setData(response.data)).catch(() => setData({data:[] }));
  }, []);

  return (
    <>
      <PageTitle title="Invoices" sub="Finance-ready documents from confirmed challans." />
      <Card title="Invoice register">
        <table>
          <thead>
            <tr><th>Invoice</th><th>Challan</th><th>Customer</th><th>Subtotal</th><th>Tax</th><th>Total</th><th /></tr>
          </thead>
          <tbody>
            {data.data.map((item:any) => (
              <tr key={item.id}>
                <td className="mono">{item.invoice_number}</td>
                <td>{item.challan_number}</td>
                <td>{item.customer_name}</td>
                <td>₹{Number(item.subtotal).toLocaleString()}</td>
                <td>{item.tax_percent}%</td>
                <td><b>₹{Number(item.total).toLocaleString()}</b></td>
                <td><a className="link" href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/invoices/${item.id}/pdf`} target="_blank">PDF</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.data.length && <Empty text="No invoices yet. Confirm a challan, then generate one." />}
      </Card>
    </>
  );
}

function Users(){
  const [data,setData] = useState<any>({data:[]});
  const load = () => api.get('/users').then(response => setData(response.data));

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageTitle title="People & permissions" sub="Admin control over access and account status." />
      <Card title="User management">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.data.map((user:any) => (
              <tr key={user.id}>
                <td><b>{user.name}</b></td>
                <td>{user.email}</td>
                <td><span className="pill">{user.role}</span></td>
                <td><span className={`pill ${user.is_active ? 'active' : 'inactive'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<GenericList type="customers" />} />
        <Route path="customers/new" element={<CreateCustomer />} />
        <Route path="products" element={<GenericList type="products" />} />
        <Route path="products/new" element={<CreateProduct />} />
        <Route path="challans" element={<GenericList type="challans" />} />
        <Route path="challans/new" element={<CreateChallan />} />
        <Route path="low-stock" element={<LowStock />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="users" element={<Users />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

