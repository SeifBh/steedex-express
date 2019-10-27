<?php



namespace DemandeBundle\Entity;



use DemandeBundle\Enum\DemandeEtatEnum;

use DemandeBundle\Enum\DemandeTypeDCEnum;

use DemandeBundle\Enum\DemandeTypeEnum;

use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Validator\Constraints\DateTime;

use JMS\Serializer\Annotation as Serializer;



/**

 * Demande

 *

 * @ORM\Table(name="demande")

 * @ORM\Entity(repositoryClass="DemandeBundle\Repository\DemandeRepository")

 *

 */

class Demande

{

    /**

     * @var int

     * @Serializer\Expose


     * @ORM\Column(name="id", type="integer")

     * @ORM\Id

     * @ORM\GeneratedValue(strategy="AUTO")

     */

    public $id;



    /**

     * @var string

     * @Serializer\Expose


     * @ORM\Column(name="titre", type="string", length=255,nullable=true)

     */

    public $titre;



    /**

     * @Serializer\Expose


     * @var string

     *

     * @ORM\Column(name="nom_prenom_recept", type="string", length=255,nullable=true)

     */

    public $nom_prenom_recept;



    /**

     * @var string


     * @ORM\Column(name="addresse_recept", type="string", length=255 ,nullable=true)

     */

    public $addresse_recept;





    /**

     * @var string


     * @ORM\Column(name="telephone_recept", type="string", length=255,nullable=true)

     */

    public $telephone_recept;



    /**

     * @var integer



     * @ORM\Column(name="montant", type="integer", nullable=true)

     */

    public $montant;





    /**

     * @var integer

     *

     * @ORM\Column(name="fraisLivraison", type="integer", nullable=true)

     */

    public $fraisLivraison;



    /**

     * @return int

     */

    public function getFraisLivraison()

    {

        return $this->fraisLivraison;

    }



    /**

     * @param int $fraisLivraison

     */

    public function setFraisLivraison($fraisLivraison)

    {

        $this->fraisLivraison = $fraisLivraison;

    }









    /**

     * @var string



     * @ORM\Column(name="note", type="string", length=255,nullable=true)

     */

    public $note;





    /**

     * @var string



     * @ORM\Column(name="etat", type="string", length=255,nullable=true)

     */

    public $etat;







    //...



    /**

     * @param string $etat

     * @return Demande

     */

    public function setEtat($etat)

    {

        if (!in_array($etat, DemandeEtatEnum::getAvailableTypes())) {

            throw new \InvalidArgumentException("Invalid etat");

        }



        $this->etat = $etat;



        return $this;

    }



    /**

     * @var date $date_livraison

     *

     * @ORM\Column(name="date_livraison", type="datetime", nullable=true)

     */

    public $date_livraison;



    /**

     * @var date $updated_date

     *

     * @ORM\Column(name="updated_date", type="datetime", nullable=true)

     */

    public $updated_date;



    /**

     * @return date

     */

    public function getUpdatedDate()

    {

        return $this->updated_date;

    }



    /**

     * @param date $updated_date

     */

    public function setUpdatedDate($updated_date)

    {

        $this->updated_date = $updated_date;

    }





    /**

     * @return date

     */

    public function getDateLivraison()

    {

        return $this->date_livraison;

    }



    /**

     * @param date $date_livraison

     */

    public function setDateLivraison($date_livraison)

    {

        $this->date_livraison = $date_livraison;

    }







    /**

     * @var date $date_emission

     *

     * @ORM\Column(name="date_emission", type="datetime", nullable=true)

     */

    public $date_emission;









    /**

     * @var date $date_echeance

     *

     * @ORM\Column(name="date_echeance", type="date", nullable=true)

     */

    public $date_echeance;







    /**

     * @var date $date_recepetion



     * @ORM\Column(name="date_reception", type="date", nullable=true)

     */

    public $date_recepetion;









    /**

     * @var integer



     * @ORM\Column(name="quantite", type="integer",nullable=true)

     */

    public $quantite;





    /**

     * @var integer

     *

     * @ORM\Column(name="pointure", type="integer",nullable=true)

     */

    public $pointure;





    /**

     * @var string

     *

     * @ORM\Column(name="taille", type="string",length=255,nullable=true)

     */

    public $taille;





    /**

     * @var string

     *

     * @ORM\Column(name="lieu", type="string",length=255,nullable=true)

     */

    public $lieu;



    /**

     * @return string

     */

    public function getLieu()

    {

        return $this->lieu;

    }



    /**

     * @param string $lieu

     */

    public function setLieu($lieu)

    {

        $this->lieu = $lieu;

    }







    /**

     * @var string

     *

     * @ORM\Column(name="tailleColis", type="string",length=255,nullable=true)

     */

    public $tailleColis;







    /**

     * @var string

     *

     * @ORM\Column(name="descProd", type="string",length=255,nullable=true)

     */

    public $descProd;



    /**

     * @return mixed

     */

    public function getDescProd()

    {

        return $this->descProd;

    }



    /**

     * @param mixed $descProd

     */

    public function setDescProd($descProd)

    {

        $this->descProd = $descProd;

    }





    /**

     * @ORM\Column(name="archive", type="boolean",nullable=true)

     */

    public $archive;



    /**

     * @return mixed

     */

    public function getArchive()

    {

        return $this->archive;

    }



    /**

     * @param mixed $archive

     */

    public function setArchive($archive)

    {

        $this->archive = $archive;

    }



    /**

     * @ORM\Column(name="fragile", type="boolean",nullable=true)

     */

    public $fragile;







    /**

     * @ORM\Column(name="readDemande", type="boolean",nullable=true)

     */

    public $readDemande;



    /**

     * @ORM\Column(name="modifiedDemande", type="boolean",nullable=true)

     */

    public $modifiedDemande;



    /**

     * @return date

     */

    public function getDateEcheance()

    {

        return $this->date_echeance;

    }



    /**

     * @param date $date_echeance

     */

    public function setDateEcheance($date_echeance)

    {

        $this->date_echeance = $date_echeance;

    }







    /**

     * @return mixed

     */

    public function getReadDemande()

    {

        return $this->readDemande;

    }



    /**

     * @param mixed $readDemande

     */

    public function setReadDemande($readDemande)

    {

        $this->readDemande = $readDemande;

    }



    /**

     * @return mixed

     */

    public function getModifiedDemande()

    {

        return $this->modifiedDemande;

    }



    /**

     * @param mixed $modifiedDemande

     */

    public function setModifiedDemande($modifiedDemande)

    {

        $this->modifiedDemande = $modifiedDemande;

    }















    /**

     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User")

     * @ORM\JoinColumn(name="id_client",referencedColumnName="id",nullable=true)

     */

    public $id_client;







    /**

     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User")

     * @ORM\JoinColumn(name="id_livreur",referencedColumnName="id",onDelete="SET NULL",nullable=true)

     */

    public $id_livreur;



    /**

     * @return mixed

     */

    public function getIdClient()

    {

        return $this->id_client;

    }



    /**

     * @param mixed $id_client

     */

    public function setIdClient($id_client)

    {

        $this->id_client = $id_client;

    }



    /**

     * @return mixed

     */

    public function getIdLivreur()

    {

        return $this->id_livreur;

    }



    /**

     * @param mixed $id_livreur

     */

    public function setIdLivreur($id_livreur)

    {

        $this->id_livreur = $id_livreur;

    }











    /**

     * @return int

     */

    public function getId()

    {

        return $this->id;

    }



    /**

     * @param int $id

     */

    public function setId($id)

    {

        $this->id = $id;

    }



    /**

     * @return string

     */

    public function getTitre()

    {

        return $this->titre;

    }



    /**

     * @param string $titre

     */

    public function setTitre($titre)

    {

        $this->titre = $titre;

    }



    /**

     * @return string

     */

    public function getNomPrenomRecept()

    {

        return $this->nom_prenom_recept;

    }



    /**

     * @param string $nom_prenom_recept

     */

    public function setNomPrenomRecept($nom_prenom_recept)

    {

        $this->nom_prenom_recept = $nom_prenom_recept;

    }



    /**

     * @return string

     */

    public function getAddresseRecept()

    {

        return $this->addresse_recept;

    }



    /**

     * @param string $addresse_recept

     */

    public function setAddresseRecept($addresse_recept)

    {

        $this->addresse_recept = $addresse_recept;

    }



    /**

     * @return string

     */

    public function getTelephoneRecept()

    {

        return $this->telephone_recept;

    }



    /**

     * @param string $telephone_recept

     */

    public function setTelephoneRecept($telephone_recept)

    {

        $this->telephone_recept = $telephone_recept;

    }



    /**

     * @return string

     */

    public function getMontant()

    {

        return $this->montant;

    }



    /**

     * @param string $montant

     */

    public function setMontant($montant)

    {

        $this->montant = $montant;

    }



    /**

     * @return string

     */

    public function getNote()

    {

        return $this->note;

    }



    /**

     * @param string $note

     */

    public function setNote($note)

    {

        $this->note = $note;

    }



    /**

     * @return mixed

     */

    public function getEtat()

    {

        return $this->etat;

    }











    /**

     * @return date

     */

    public function getDateEmission()

    {

        return $this->date_emission;

    }



    /**

     * @param date $date_emission

     */

    public function setDateEmission($date_emission)

    {

        $this->date_emission = $date_emission;

    }



    /**

     * @return date

     */

    public function getDateRecepetion()

    {

        return $this->date_recepetion;

    }



    /**

     * @param date $date_recepetion

     */

    public function setDateRecepetion($date_recepetion)

    {

        $this->date_recepetion = $date_recepetion;

    }



    /**

     * @return int

     */

    public function getQuantite()

    {

        return $this->quantite;

    }



    /**

     * @param int $quantite

     */

    public function setQuantite($quantite)

    {

        $this->quantite = $quantite;

    }



    /**

     * @return int

     */

    public function getPointure()

    {

        return $this->pointure;

    }



    /**

     * @param int $pointure

     */

    public function setPointure($pointure)

    {

        $this->pointure = $pointure;

    }



    /**

     * @return string

     */

    public function getTaille()

    {

        return $this->taille;

    }



    /**

     * @param string $taille

     */

    public function setTaille($taille)

    {

        $this->taille = $taille;

    }



    /**

     * @return mixed

     */

    public function getFragile()

    {

        return $this->fragile;

    }



    /**

     * @param mixed $fragile

     */

    public function setFragile($fragile)

    {

        $this->fragile = $fragile;

    }



    /**

     * @return mixed

     */

    public function getTailleColis()

    {

        return $this->tailleColis;

    }



    /**

     * @param mixed $tailleColis

     */

    public function setTailleColis($tailleColis)

    {

        $this->tailleColis = $tailleColis;

    }





    /**

     * @var string

     * @ORM\Column(name="type", type="string", length=255, nullable=true)

     */

    public $type;



    //...



    /**

     * @param string $etat

     * @return Demande

     */

    public function setType($type)

    {

        if (!in_array($type, DemandeTypeEnum::getAvailableTypes())) {

            throw new \InvalidArgumentException("Invalid type");

        }



        $this->type = $type;



        return $this;

    }











    public function __construct()

    {

    }



    /**

     * @return string

     */

    public function getType()

    {

        return $this->type;

    }















   /**

     * @var string

     * @Serializer\Expose



     * @ORM\Column(name="quoi", type="string", length=255,nullable=true)

     */
   
    public $quoi;



















    /**



     * @var string



     * @ORM\Column(name="typeDC", type="string", length=255, nullable=true)



     */



    public $typeDC;

















    /**



     * @return string



     */



    public function getQuoi()



    {



        return $this->quoi;



    }







    /**



     * @param string $quoi



     */



    public function setQuoi($quoi)



    {



        $this->quoi = $quoi;



    }













    /**



     * @return string



     */



    public function getTypeDC()



    {



        return $this->typeDC;



    }















    /**



     * @param string $typeDC



     * @return Demande



     */



    public function setTypeDC($typeDC)



    {



        if (!in_array($typeDC, DemandeTypeDCEnum::getAvailableTypes())) {



            throw new \InvalidArgumentException("Invalid type");



        }







        $this->typeDC = $typeDC;







        return $this;



    }







}



